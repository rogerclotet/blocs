#!/usr/bin/env python3
"""Rasterize the in-game GlossyBlock into Expo iOS, Android, and web icons."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

# Matches src/theme/themes.ts and src/components/GamePieces.tsx GlossyBlock.
FACE = (155, 114, 242, 255)  # #9B72F2
DARK = (98, 65, 181, 255)  # #6241B5
BACKGROUND = (23, 19, 33, 255)  # #171321
SHINE = (255, 255, 255, 64)  # white at 0.25 opacity
SHADOW = (155, 114, 242, 72)

SUPER = 8
ASSETS = Path(__file__).resolve().parent.parent / "assets" / "icons"


def rounded_mask(size: int, radius: float) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def draw_glossy_block(size: int) -> Image.Image:
    """Draw one purple GlossyBlock at `size` pixels, matching in-game geometry."""
    work = size * SUPER
    radius = work * 0.24
    layer = Image.new("RGBA", (work, work), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.rounded_rectangle((0, 0, work - 1, work - 1), radius=radius, fill=DARK)

    face_bottom = work * 0.91
    draw.rounded_rectangle((0, 0, work - 1, face_bottom), radius=radius, fill=FACE)

    shine = Image.new("RGBA", (work, work), (0, 0, 0, 0))
    ImageDraw.Draw(shine).rounded_rectangle(
        (work * 0.15, work * 0.12, work * 0.63, work * 0.30),
        radius=radius,
        fill=SHINE,
    )
    layer = Image.alpha_composite(layer, shine)

    mask = rounded_mask(work, radius)
    r, g, b, a = layer.split()
    layer = Image.merge("RGBA", (r, g, b, ImageChops.multiply(a, mask)))
    return layer.resize((size, size), Image.Resampling.LANCZOS)


def drop_shadow(block: Image.Image, canvas: int, cx: int, cy: int) -> Image.Image:
    """Soft purple glow scaled from the in-game block shadow."""
    size = block.size[0]
    blur = max(8, round(size * 0.08))
    offset_y = max(4, round(size * 0.045))
    pad = blur * 2 + offset_y
    shadow = Image.new("RGBA", (size + pad * 2, size + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (pad, pad, pad + size - 1, pad + size - 1),
        radius=size * 0.24,
        fill=SHADOW,
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    out.alpha_composite(shadow, (cx - pad, cy - pad + offset_y))
    out.alpha_composite(block, (cx, cy))
    return out


def compose(canvas: int, block_size: int, background: tuple[int, int, int, int] | None) -> Image.Image:
    block = draw_glossy_block(block_size)
    origin = (canvas - block_size) // 2
    layer = drop_shadow(block, canvas, origin, origin)
    if background is None:
        return layer
    base = Image.new("RGBA", (canvas, canvas), background)
    return Image.alpha_composite(base, layer)


def save_rgb(image: Image.Image, path: Path) -> None:
    image.convert("RGB").save(path, "PNG", optimize=True)
    print(f"wrote {path.name} {image.size[0]}x{image.size[1]} RGB")


def save_rgba(image: Image.Image, path: Path) -> None:
    image.save(path, "PNG", optimize=True)
    print(f"wrote {path.name} {image.size[0]}x{image.size[1]} RGBA")


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)

    # iOS / App Store / Expo `icon`: 1024×1024, opaque.
    # Block sits at ~62.5% so the iOS squircle mask does not clip it.
    save_rgb(compose(1024, 640, BACKGROUND), ASSETS / "app-icon.png")

    # Android adaptive foreground: 1024×1024, transparent.
    # Content stays inside the 72/108 safe zone (~66% of the canvas).
    save_rgba(compose(1024, 540, None), ASSETS / "adaptive-foreground.png")

    # Android adaptive background plate (used if backgroundImage is set).
    save_rgb(Image.new("RGB", (1024, 1024), BACKGROUND[:3]), ASSETS / "adaptive-background.png")

    # Web / PWA favicon.
    save_rgb(compose(192, 120, BACKGROUND), ASSETS / "favicon.png")


if __name__ == "__main__":
    main()
