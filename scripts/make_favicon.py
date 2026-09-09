#!/usr/bin/env python3
"""Generate FIRA favicon set from the updated logo (FIRA LOGO.jpg).
Outputs:
  - src/app/favicon.ico          (16/32/48/64 multi-res, transparent bg)
  - public/icon-192.png          (transparent bg)
  - public/icon-512.png          (transparent bg)
  - public/apple-touch-icon.png  (180x180)
  - /home/z/my-project/download/fira-favicon-preview.png (64px visual check)
"""
from PIL import Image, ImageDraw
import os

SRC = "/home/z/my-project/upload/FIRA LOGO.jpg"
PROJ = "/home/z/my-project/download/gdrive_workspace/extracted"
PREVIEW = "/home/z/my-project/download/fira-favicon-preview.png"

im = Image.open(SRC).convert("RGB")
print("source:", im.size, im.mode)

# ── 1. Auto-crop white border ────────────────────────────────────────────
gray = im.convert("L")
# bbox of non-white pixels (threshold 245 to tolerate JPEG noise)
bbox = gray.point(lambda p: 255 if p < 245 else 0).getbbox()
print("content bbox:", bbox)
left, top, right, bottom = bbox
# add 3% padding around the emblem, keep square
w, h = right - left, bottom - top
pad = int(max(w, h) * 0.03)
left = max(0, left - pad)
top = max(0, top - pad)
right = min(im.width, right + pad)
bottom = min(im.height, bottom + pad)
cw, ch = right - left, bottom - top
side = max(cw, ch)
# center-crop to square
cx, cy = (left + right) // 2, (top + bottom) // 2
half = side // 2
left = max(0, cx - half)
top = max(0, cy - half)
cropped = im.crop((left, top, left + side, top + side))
print("cropped square:", cropped.size)

# ── 2. Transparent version: flood-fill white margin from the 4 corners ──
ff = cropped.copy()
SENTINEL = (255, 0, 255)  # magenta — not present in this logo (blue/red only)
d = ImageDraw.floodfill
for xy in [(0, 0), (ff.width - 1, 0), (0, ff.height - 1), (ff.width - 1, ff.height - 1)]:
    d(ff, xy, SENTINEL, thresh=30)

rgba = ff.convert("RGBA")
px = rgba.load()
n_transparent = 0
for y in range(rgba.height):
    for x in range(rgba.width):
        r, g, b, a = px[x, y]
        if r == 255 and g == 0 and b == 255:
            px[x, y] = (255, 255, 255, 0)
            n_transparent += 1
total = rgba.width * rgba.height
print(f"transparent pixels: {n_transparent}/{total} ({100*n_transparent/total:.1f}%)")
if n_transparent < total * 0.05:
    print("WARN: flood-fill barely worked — check margins")

# ── 3. Emit all sizes ────────────────────────────────────────────────────
base = rgba.resize((256, 256), Image.LANCZOS)

os.makedirs(os.path.join(PROJ, "src", "app"), exist_ok=True)
base.save(os.path.join(PROJ, "src", "app", "favicon.ico"),
          format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

for size, name in [(192, "icon-192.png"), (512, "icon-512.png"),
                   (180, "apple-touch-icon.png")]:
    rgba.resize((size, size), Image.LANCZOS).save(os.path.join(PROJ, "public", name))

# ── 4. Preview strip: 16 / 32 / 64 renders side by side on dark+light ────
prev = Image.new("RGB", (64 * 3 + 40, 64 * 2 + 30), (24, 24, 27))  # dark row
x = 10
for s in (16, 32, 64):
    icon = rgba.resize((s, s), Image.LANCZOS)
    prev.paste(icon, (x, 10), icon)
    x += s + 10
light_row = Image.new("RGB", (64 * 3 + 40, 74), (255, 255, 255))
x = 10
for s in (16, 32, 64):
    icon = rgba.resize((s, s), Image.LANCZOS)
    light_row.paste(icon, (x, 5), icon)
    x += s + 10
prev.paste(light_row, (0, 74))
prev.save(PREVIEW)

print("DONE")
for f in ["src/app/favicon.ico", "public/icon-192.png", "public/icon-512.png",
          "public/apple-touch-icon.png"]:
    p = os.path.join(PROJ, f)
    print(f"  {f}: {os.path.getsize(p)} bytes")
print(f"  preview: {PREVIEW} ({os.path.getsize(PREVIEW)} bytes)")
