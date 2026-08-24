"""Generate PWA + Tauri icons for Stackmint Studio."""

from PIL import Image, ImageDraw
import os
import math

OUT_DIR = "/home/z/my-project/public/icons"
SRC_DIR = "/home/z/my-project/src-tauri/icons"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(SRC_DIR, exist_ok=True)


def make_gradient(size, c1, c2):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            r = int(c1[0] + (c2[0] - c1[0]) * t)
            g = int(c1[1] + (c2[1] - c1[1]) * t)
            b = int(c1[2] + (c2[2] - c1[2]) * t)
            px[x, y] = (r, g, b)
    return img


def make_icon(size, maskable=False):
    # Stackmint brand: violet -> fuchsia gradient (premium feel)
    c1 = (139, 92, 246)   # violet-500
    c2 = (217, 70, 239)   # fuchsia-500

    img = make_gradient(size, c1, c2).convert("RGBA")

    if maskable:
        glyph_size = int(size * 0.5)
    else:
        glyph_size = int(size * 0.6)

    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Draw a 4-pointed sparkle/star shape (Stackmint logo)
    cx = size // 2
    cy = size // 2
    radius = glyph_size // 2

    # Main 4-point star
    points = []
    for i in range(8):
        angle = i * math.pi / 4 - math.pi / 2
        r = radius if i % 2 == 0 else radius // 3
        x = cx + int(r * math.cos(angle))
        y = cy + int(r * math.sin(angle))
        points.append((x, y))
    draw.polygon(points, fill=(255, 255, 255, 245))

    # Small dot accent (top-right)
    dot_r = max(2, radius // 8)
    dot_x = cx + int(radius * 0.7)
    dot_y = cy - int(radius * 0.7)
    draw.ellipse(
        [dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r],
        fill=(255, 255, 255, 230),
    )

    return Image.alpha_composite(img, overlay)


sizes = [
    (192, "icon-192.png", False),
    (512, "icon-512.png", False),
    (512, "icon-512-maskable.png", True),
    (180, "apple-touch-icon.png", False),
    (32, "favicon-32.png", False),
    (16, "favicon-16.png", False),
]

for size, name, maskable in sizes:
    img = make_icon(size, maskable=maskable)
    img.save(os.path.join(OUT_DIR, name), "PNG", optimize=True)
    print(f"  OK {name} ({size}x{size})")

favicon_ico = make_icon(48, maskable=False)
favicon_ico.save("/home/z/my-project/public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("  OK favicon.ico")

# Tauri icons
src_1024 = make_icon(1024, maskable=False)
src_1024.save(os.path.join(SRC_DIR, "app-icon.png"), "PNG", optimize=True)
print(f"  OK app-icon.png (1024x1024 — Tauri source)")

for size in [32, 128]:
    img = make_icon(size, maskable=False)
    img.save(os.path.join(SRC_DIR, f"{size}x{size}.png"), "PNG", optimize=True)
    print(f"  OK {size}x{size}.png")
img = make_icon(256, maskable=False)
img.save(os.path.join(SRC_DIR, "128x128@2x.png"), "PNG", optimize=True)
print(f"  OK 128x128@2x.png")

ico = make_icon(256, maskable=False)
ico.save(os.path.join(SRC_DIR, "icon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print("  OK icon.ico (Windows)")

icns_src = make_icon(512, maskable=False)
icns_src.save(os.path.join(SRC_DIR, "icon.icns"), format="PNG")
print("  OK icon.icns (placeholder)")

print("\nAll Stackmint icons generated.")
