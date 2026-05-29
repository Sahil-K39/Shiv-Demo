import os
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.environ.get("LOGO_SRC_DIR", os.path.join(BASE_DIR, "Final Icons SSP"))
DST_DIR = os.environ.get("LOGO_DST_DIR", os.path.join(BASE_DIR, "frontend", "public", "logos"))
os.makedirs(DST_DIR, exist_ok=True)

files = [
    ("6688da01-d12f-4a6f-a9fb-502e863f402d.png", "logo1.png"),
    ("ca3942b4-4baf-46e6-84e3-9dd9d9d0f4ac.png", "logo2.png"),
    ("ecb517ee-0888-4d4a-bde4-ddd49ea43f4e.png", "logo3.png"),
    ("ecd14b11-d6a2-43ce-a2af-c02d0b1cb9a2.png", "logo4.png"),
]

for src_name, dst_name in files:
    src = os.path.join(SRC_DIR, src_name)
    dst = os.path.join(DST_DIR, dst_name)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"  ✓ Copied {dst_name}")
    else:
        print(f"  ✗ NOT FOUND: {src_name}")

print(f"\nDone! Logos in: {DST_DIR}")
