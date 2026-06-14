#!/usr/bin/env python3
from __future__ import annotations

import argparse
from collections import deque
from concurrent.futures import ProcessPoolExecutor, as_completed
import json
import math
import os
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".webp"}
CANVAS_SIZE = (1200, 1600)


def product_dirs(source: Path) -> list[Path]:
    return sorted(
        [path for path in source.iterdir() if path.is_dir()],
        key=lambda path: path.name.lower(),
    )


def product_images(folder: Path) -> list[Path]:
    return sorted(
        [
            path
            for path in folder.iterdir()
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        ],
        key=lambda path: path.name.lower(),
    )


def premium_background(size: tuple[int, int]) -> Image.Image:
    width, height = size
    image = Image.new("RGB", size)
    pixels = image.load()

    top = (238, 236, 230)
    mid = (248, 247, 243)
    bottom = (222, 218, 210)
    center_x = width * 0.48
    center_y = height * 0.36
    max_distance = math.hypot(width * 0.62, height * 0.62)

    for y in range(height):
        vertical = y / max(height - 1, 1)
        if vertical < 0.58:
            t = vertical / 0.58
            base = tuple(int(top[i] * (1 - t) + mid[i] * t) for i in range(3))
        else:
            t = (vertical - 0.58) / 0.42
            base = tuple(int(mid[i] * (1 - t) + bottom[i] * t) for i in range(3))

        for x in range(width):
            distance = math.hypot(x - center_x, y - center_y) / max_distance
            lift = max(0, 1 - distance * 2.2) * 14
            vignette = max(0, distance - 0.34) * 20
            pixels[x, y] = tuple(
                max(0, min(255, int(channel + lift - vignette))) for channel in base
            )

    draw = ImageDraw.Draw(image, "RGBA")
    draw.rectangle(
        [0, int(height * 0.76), width, height],
        fill=(218, 215, 208, 70),
    )
    return image


def foreground_alpha(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    mask = Image.new("L", rgb.size, 255)
    src = rgb.load()
    out = mask.load()
    width, height = rgb.size

    for y in range(height):
        for x in range(width):
            r, g, b = src[x, y]
            green_delta = min(g - r, g - b)
            # The source backdrop ranges from bright chroma green to very dark
            # green shadows. Key both, while preserving black garments where
            # green is not meaningfully dominant.
            dim_green_shadow = g > 24 and green_delta > 9 and g > int(r * 1.2) and g > int(b * 1.2)
            green_dominant = g > 52 and green_delta > 12 and g > int(r * 1.08) and g > int(b * 1.08)
            strong_green = g > 78 and green_delta > 28 and g > int(r * 1.16) and g > int(b * 1.16)

            if strong_green or dim_green_shadow:
                alpha = 0
            elif green_dominant:
                alpha = max(0, min(255, int(255 - (green_delta - 12) * 6.2)))
            else:
                alpha = 255

            out[x, y] = alpha

    mask = mask.filter(ImageFilter.GaussianBlur(1.4))
    return mask.point(lambda value: 0 if value < 16 else (255 if value > 242 else value))


def edge_connected_background_alpha(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    src = rgb.load()
    candidate = bytearray(width * height)

    for y in range(height):
        row = y * width
        for x in range(width):
            r, g, b = src[x, y]
            green_delta = min(g - r, g - b)
            green_candidate = g > 24 and green_delta > 9 and g > int(r * 1.14) and g > int(b * 1.14)
            if green_candidate:
                candidate[row + x] = 1

    background = bytearray(width * height)
    queue: deque[int] = deque()

    def push(index: int) -> None:
        if candidate[index] and not background[index]:
            background[index] = 1
            queue.append(index)

    for x in range(width):
        push(x)
        push((height - 1) * width + x)
    for y in range(height):
        push(y * width)
        push(y * width + width - 1)

    while queue:
        index = queue.popleft()
        x = index % width
        y = index // width
        if x > 0:
            push(index - 1)
        if x < width - 1:
            push(index + 1)
        if y > 0:
            push(index - width)
        if y < height - 1:
            push(index + width)

    alpha = Image.new("L", (width, height), 255)
    out = alpha.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if background[row + x]:
                out[x, y] = 0

    return alpha.filter(ImageFilter.GaussianBlur(0.6))


def despill(image: Image.Image, alpha: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    src = rgba.load()
    matte = alpha.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            r, g, b, _ = src[x, y]
            a = matte[x, y]
            if a < 255 or (g > r + 16 and g > b + 16):
                neutral_green = int((r + b) * 0.54)
                g = min(g, neutral_green)
            src[x, y] = (r, g, b, a)

    return rgba


def crop_to_subject(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 22 else 0).getbbox()
    if not bbox:
        return image

    left, top, right, bottom = bbox
    pad_x = max(18, int((right - left) * 0.045))
    pad_y = max(18, int((bottom - top) * 0.045))
    return image.crop(
        (
            max(0, left - pad_x),
            max(0, top - pad_y),
            min(image.width, right + pad_x),
            min(image.height, bottom + pad_y),
        )
    )


def fit_subject(subject: Image.Image, canvas_size: tuple[int, int]) -> Image.Image:
    max_width = int(canvas_size[0] * 0.9)
    max_height = int(canvas_size[1] * 0.92)
    fitted = subject.copy()
    fitted.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
    return fitted


def compose_product(source: Path, destination: Path) -> dict[str, object]:
    opened = ImageOps.exif_transpose(Image.open(source))
    has_alpha = opened.mode in {"RGBA", "LA"} or "transparency" in opened.info
    if has_alpha:
        rgba = opened.convert("RGBA")
        rgba.thumbnail((1800, 2400), Image.Resampling.LANCZOS)
        image = rgba.convert("RGB")
        alpha = rgba.getchannel("A").filter(ImageFilter.GaussianBlur(0.45))
        keyed_alpha = foreground_alpha(image)
        alpha = ImageChops.darker(alpha, keyed_alpha)
    else:
        image = opened.convert("RGB")
        image.thumbnail((1800, 2400), Image.Resampling.LANCZOS)
        alpha = foreground_alpha(image)

    edge_alpha = edge_connected_background_alpha(image)
    alpha = ImageChops.darker(alpha, edge_alpha)

    subject = despill(image, alpha)
    subject = crop_to_subject(subject)
    subject = fit_subject(subject, CANVAS_SIZE)

    canvas = premium_background(CANVAS_SIZE).convert("RGBA")
    shadow = subject.getchannel("A").filter(ImageFilter.GaussianBlur(28))
    shadow = shadow.point(lambda value: int(value * 0.22))
    shadow_layer = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))

    x = (CANVAS_SIZE[0] - subject.width) // 2
    y = int((CANVAS_SIZE[1] - subject.height) * 0.5)
    shadow_layer.paste((28, 25, 22, 0), (x + 18, y + 34), shadow)
    canvas = Image.alpha_composite(canvas, shadow_layer)
    canvas.alpha_composite(subject, (x, y))

    destination.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(destination, "WEBP", quality=88, method=6)

    return {
        "source": str(source),
        "destination": str(destination),
        "width": CANVAS_SIZE[0],
        "height": CANVAS_SIZE[1],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path("Final Products"))
    parser.add_argument(
        "--output", type=Path, default=Path("frontend/public/final-products")
    )
    parser.add_argument("--limit-products", type=int, default=0)
    parser.add_argument("--limit-images", type=int, default=0)
    parser.add_argument("--workers", type=int, default=max(1, min(6, (os.cpu_count() or 2) - 1)))
    args = parser.parse_args()

    manifest: dict[str, list[dict[str, object]]] = {}
    folders = product_dirs(args.source)
    if args.limit_products:
        folders = folders[: args.limit_products]

    jobs: list[tuple[str, Path, Path]] = []
    for folder in folders:
        files = product_images(folder)
        if args.limit_images:
            files = files[: args.limit_images]

        for index, source in enumerate(files, start=1):
            destination = args.output / folder.name.lower() / f"{folder.name.lower()}-{index:02d}.webp"
            jobs.append((folder.name, source, destination))

        manifest[folder.name] = []

    with ProcessPoolExecutor(max_workers=args.workers) as executor:
        futures = {
            executor.submit(compose_product, source, destination): (folder_name, source)
            for folder_name, source, destination in jobs
        }
        completed = 0
        for future in as_completed(futures):
            folder_name, source = futures[future]
            try:
                manifest[folder_name].append(future.result())
            except Exception as exc:
                raise RuntimeError(f"Failed processing {source}: {exc}") from exc
            completed += 1
            if completed % 10 == 0 or completed == len(jobs):
                print(f"Processed {completed}/{len(jobs)} images")

    for folder_name in manifest:
        manifest[folder_name] = sorted(
            manifest[folder_name], key=lambda item: str(item["destination"])
        )
        print(f"{folder_name}: {len(manifest[folder_name])} images")

    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Wrote {(args.output / 'manifest.json')}")


if __name__ == "__main__":
    main()
