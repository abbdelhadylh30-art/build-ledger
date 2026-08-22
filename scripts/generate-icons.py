"""Generate PWA + Tauri icons for Build Ledger."""

from PIL import Image, ImageDraw
import os

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
    c1 = (139, 92, 246)
    c2 = (217, 70, 239)

    img = make_gradient(size, c1, c2).convert("RGBA")

    if maskable:
        glyph_size = int(size * 0.5)
    else:
        glyph_size = int(size * 0.6)

    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    bar_w = max(2, glyph_size // 5)
    gap = max(1, bar_w // 2)
    total_w = 3 * bar_w + 2 * gap
    start_x = (size - total_w) // 2

    heights = [int(glyph_size * 0.7), int(glyph_size * 0.5), int(glyph_size * 0.85)]
    base_y = (size + max(heights)) // 2

    radius = max(1, bar_w // 3)
    for i, h in enumerate(heights):
        x0 = start_x + i * (bar_w + gap)
        y0 = base_y - h
        x1 = x0 + bar_w
        y1 = base_y
        draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=(255, 255, 255, 240))

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

# --- Tauri source icon (1024x1024 PNG) ---
# Tauri's `tauri icon` command uses this to generate all required sizes.
src_1024 = make_icon(1024, maskable=False)
src_1024.save(os.path.join(SRC_DIR, "app-icon.png"), "PNG", optimize=True)
print(f"  OK app-icon.png (1024x1024 — Tauri source)")

# Pre-generate the sizes Tauri needs (in case user can't run `tauri icon`)
for size in [32, 128]:
    img = make_icon(size, maskable=False)
    img.save(os.path.join(SRC_DIR, f"{size}x{size}.png"), "PNG", optimize=True)
    print(f"  OK {size}x{size}.png")
img = make_icon(256, maskable=False)
img.save(os.path.join(SRC_DIR, "128x128@2x.png"), "PNG", optimize=True)
print(f"  OK 128x128@2x.png")

# Generate .ico for Windows (Tauri requires icon.ico)
ico = make_icon(256, maskable=False)
ico.save(os.path.join(SRC_DIR, "icon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print("  OK icon.ico (Windows)")

# Generate .icns for macOS (Tauri requires icon.icns) — using PNG fallback
# Note: PIL doesn't support .icns natively on Linux; user can run `tauri icon` to regenerate
# We'll create a placeholder by copying a 512x512 PNG
icns_src = make_icon(512, maskable=False)
icns_src.save(os.path.join(SRC_DIR, "icon.icns"), format="PNG")  # Not a real .icns but Tauri will skip on Linux/Windows builds
print("  OK icon.icns (placeholder — rebuild with `npm run tauri icon` for macOS)")

print("\nAll icons generated.")
