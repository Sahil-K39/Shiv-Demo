#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
from pathlib import Path


OUTPUT_DIR = Path("data")
MANIFEST_PATH = Path("frontend/public/final-products/manifest.json")
JSON_OUTPUT = OUTPUT_DIR / "final-products-import.json"
CSV_OUTPUT = OUTPUT_DIR / "final-products-import.csv"

STYLE_NAMES = [
    "Midnight Ritual Slit Dress",
    "Ivory Nomad Fringe Vest",
    "Obsidian Temple Mini Set",
    "Handloom Mesh Overlay Dress",
    "Void Black Studio Wrap",
    "Bohemian Layered Vest",
    "Ritual Panelled Long Dress",
    "Ivory Texture Crop Overlay",
    "Shadow Line Festival Dress",
    "Nomad Side-Slit Tunic",
    "Temple Fringe Short Dress",
    "Desert Mesh Layered Vest",
    "Obsidian Cutwork Kaftan",
    "Ivory Artisan Open Vest",
    "Black Heritage Panel Dress",
    "Shakti Mesh Statement Top",
    "Ritual Fringe Layer Dress",
    "Nomad Studio Mini Dress",
    "Ivory Handwoven Overlay",
    "Shadow Drape Resort Dress",
    "Black Cutout Festival Set",
    "Artisan Layered Kaftan",
    "Ivory Raw-Edge Vest",
    "Obsidian Backless Dress",
    "Temple Texture Statement Piece",
    "Nomad Cotton Mesh Layer",
    "Ritual Openwork Dress",
    "Black Studio Longline Vest",
    "Ivory Resort Layered Top",
    "Shadow Fringe Mini Dress",
    "Shakti Slit Panel Dress",
    "Artisan Festival Overlay",
    "Void Black Drape Tunic",
    "Temple Weave Sleeveless Vest",
    "Nomad Raw Hem Dress",
    "Ivory Spirit Layer Set",
    "Obsidian Ceremony Dress",
    "Handloom Festival Vest",
    "Black Mesh Resort Piece",
    "Ritual Side Panel Dress",
    "Ivory Frayed Texture Top",
    "Shadow Studio Kaftan",
    "Nomad Open Front Layer",
    "Temple Cutwork Dress",
    "Shakti Premium Layered Vest",
    "Obsidian Fringe Statement Dress",
    "Ivory Ritual Studio Piece",
]

PRICES = [
    1899, 1299, 1599, 1799, 1499, 1399, 1999, 1199, 1699, 1599,
    1299, 1399, 2199, 1499, 1899, 1099, 1799, 1399, 1499, 1999,
    1699, 2099, 1299, 2299, 1899, 1199, 1999, 1499, 1299, 1399,
    2199, 1599, 1699, 1499, 1799, 1399, 2299, 1299, 1499, 1999,
    1199, 1899, 1599, 2099, 1499, 2199, 1799,
]


def folder_number(name: str) -> int:
    digits = "".join(ch for ch in name if ch.isdigit())
    return int(digits or "0")


def product_description(name: str, folder: str, image_count: int) -> str:
    return (
        f"{name} from the Shiv Shakti final product edit. A premium boutique apparel style "
        f"presented with clean studio imagery for wholesale buyers, balancing ritual-inspired "
        f"detailing, easy resort styling, and statement layering. Includes {image_count} product "
        f"views for front, side, back, and detail review before enquiry confirmation."
    )


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    products = []

    folders = [
        folder
        for folder, images in manifest.items()
        if images
    ]
    folders.sort(key=folder_number)

    for index, folder in enumerate(folders, start=1):
        slug = f"shiv-shakti-final-style-{index:02d}"
        name = STYLE_NAMES[index - 1]
        images = [
            "/" + Path(item["destination"]).relative_to("frontend/public").as_posix()
            for item in manifest[folder]
        ]
        price = PRICES[index - 1]

        products.append(
            {
                "name": name,
                "slug": slug,
                "description": product_description(name, folder, len(images)),
                "price": price,
                "sale_price": 0,
                "category": "shakti",
                "collection": "Final Products",
                "sizes": json.dumps(["XS", "S", "M", "L", "XL", "Custom"]),
                "colors": json.dumps(["Void Black", "Ivory", "Natural", "Mixed"]),
                "images": json.dumps(images),
                "quantity": 120,
                "sku": f"SS-FINAL-{index:03d}",
                "is_featured": index <= 8,
                "is_active": True,
                "sale_active": False,
                "sale_start_date": None,
                "sale_end_date": None,
            }
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    JSON_OUTPUT.write_text(json.dumps({"products": products}, indent=2), encoding="utf-8")

    fieldnames = [
        "name",
        "description",
        "price",
        "sale_price",
        "quantity",
        "category",
        "sku",
        "images",
        "sizes",
        "colors",
        "is_featured",
        "is_active",
        "sale_active",
        "sale_start_date",
        "sale_end_date",
        "slug",
        "collection",
    ]
    with CSV_OUTPUT.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for product in products:
            writer.writerow(product)

    print(f"Wrote {len(products)} products to {JSON_OUTPUT}")
    print(f"Wrote CSV import copy to {CSV_OUTPUT}")


if __name__ == "__main__":
    main()
