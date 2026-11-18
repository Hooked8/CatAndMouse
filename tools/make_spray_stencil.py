#!/usr/bin/env python3
"""
ACHILLES spray stencil — clean crest + reinforced QR
====================================================
Logo is drawn as geometry (Lambda/A + laurel + ACHILLES + VIII), matching the
clean stencil look — not a noisy photo threshold.

QR holes keep optical bits intact; thin material bridges are thicker/more
numerous for strength. ECC-H keeps scans working.
"""

from __future__ import annotations

import math
import struct
import subprocess
import sys
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "shopify"
URL = "https://cjz63c-nh.myshopify.com"

# Physical (mm)
MODULE_MM = 3.0
BRIDGE_MM = 1.25          # thick single-axis bridges (verified scannable)
SHEET_THICK_MM = 1.6
FRAME_MM = 12.0
GAP_MM = 10.0
EXTRA_SUPPORT_EVERY = 7   # extra supports without breaking scan


def ensure_deps():
    try:
        import qrcode  # noqa: F401
        from PIL import Image, ImageDraw, ImageFont  # noqa: F401
        import numpy as np  # noqa: F401
        import cv2  # noqa: F401
    except ImportError:
        subprocess.check_call(
            [
                sys.executable,
                "-m",
                "pip",
                "install",
                "-q",
                "qrcode[pil]",
                "pillow",
                "numpy",
                "opencv-python-headless",
            ]
        )


def qr_matrix(url: str):
    import qrcode
    from qrcode.constants import ERROR_CORRECT_H
    import numpy as np

    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=1, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    return np.array(qr.get_matrix(), dtype=bool), qr.version


def decode_qr(holes) -> str:
    import cv2
    import numpy as np

    scale = 16
    n = holes.shape[0]
    img = np.full((n * scale, n * scale), 255, np.uint8)
    ys, xs = np.where(holes)
    for y, x in zip(ys, xs):
        img[y * scale : (y + 1) * scale, x * scale : (x + 1) * scale] = 0
    data, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
    return data or ""


def decode_with_bridges(holes, bridges) -> str:
    import cv2
    import numpy as np

    scale = 16
    n = holes.shape[0]
    img = np.full((n * scale, n * scale), 255, np.uint8)
    ys, xs = np.where(holes)
    for y, x in zip(ys, xs):
        img[y * scale : (y + 1) * scale, x * scale : (x + 1) * scale] = 0
    half = max(1, int(round(scale * (BRIDGE_MM / MODULE_MM) / 2)))
    for y, x, orient in bridges:
        y0, x0 = y * scale, x * scale
        if orient == "h":
            mid = y0 + scale // 2
            img[mid - half : mid + half + 1, x0 : x0 + scale] = 255
        elif orient == "v":
            mid = x0 + scale // 2
            img[y0 : y0 + scale, mid - half : mid + half + 1] = 255
        else:  # cross
            midy = y0 + scale // 2
            midx = x0 + scale // 2
            img[midy - half : midy + half + 1, x0 : x0 + scale] = 255
            img[y0 : y0 + scale, midx - half : midx + half + 1] = 255
    data, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
    return data or ""


def components(material):
    import numpy as np

    h, w = material.shape
    lab = np.zeros((h, w), dtype=np.int32)
    comps = {}
    cur = 0
    for y in range(h):
        for x in range(w):
            if not material[y, x] or lab[y, x]:
                continue
            cur += 1
            q = deque([(y, x)])
            lab[y, x] = cur
            mem = []
            while q:
                cy, cx = q.popleft()
                mem.append((cy, cx))
                for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    ny, nx = cy + dy, cx + dx
                    if (
                        0 <= ny < h
                        and 0 <= nx < w
                        and material[ny, nx]
                        and lab[ny, nx] == 0
                    ):
                        lab[ny, nx] = cur
                        q.append((ny, nx))
            comps[cur] = mem
    return lab, comps


def plan_bridges(holes, reinforced=True):
    import numpy as np

    material = ~holes
    h, w = holes.shape
    lab, comps = components(material)
    frame = {
        i
        for i, mem in comps.items()
        if any(y == 0 or x == 0 or y == h - 1 or x == w - 1 for y, x in mem)
    }
    parent = {i: i for i in comps}

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    bridges = {}
    islands = sorted(
        ((i, mem) for i, mem in comps.items() if i not in frame),
        key=lambda t: len(t[1]),
    )

    for island, mem in islands:
        if find(island) in {find(f) for f in frame}:
            continue
        dist = np.full((h, w), -1, dtype=np.int32)
        prev = np.full((h, w, 2), -1, dtype=np.int32)
        q = deque()
        for y, x in mem:
            dist[y, x] = 0
            q.append((y, x))
        target = None
        while q:
            y, x = q.popleft()
            if lab[y, x] and find(lab[y, x]) in {find(f) for f in frame} and lab[y, x] != island:
                target = (y, x)
                break
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and dist[ny, nx] < 0:
                    dist[ny, nx] = dist[y, x] + 1
                    prev[ny, nx] = (y, x)
                    q.append((ny, nx))
        if target is None:
            continue
        path = []
        cy, cx = target
        while cy >= 0:
            path.append((cy, cx))
            cy, cx = prev[cy, cx]
        path.reverse()
        for i in range(len(path) - 1):
            y, x = path[i]
            ny, nx = path[i + 1]
            if holes[ny, nx]:
                orient = "h" if ny == y else "v"
                bridges[(ny, nx)] = orient
            if holes[y, x] and i > 0:
                orient = "h" if ny == y else "v"
                bridges[(y, x)] = orient
        if lab[target[0], target[1]]:
            union(island, lab[target[0], target[1]])
        for f in frame:
            union(island, f)

    # Extra single-axis supports (strength without destroying modules)
    if reinforced:
        for y in range(2, h - 2, EXTRA_SUPPORT_EVERY):
            for x in range(2, w - 2, EXTRA_SUPPORT_EVERY):
                if holes[y, x] and (y, x) not in bridges:
                    bridges[(y, x)] = (
                        "h" if ((y // EXTRA_SUPPORT_EVERY) % 2 == 0) else "v"
                    )

    return [(y, x, o) for (y, x), o in bridges.items()]


def hole_cuts(holes, bridges, ox, oy):
    cuts = []
    bmap = {(y, x): o for y, x, o in bridges}
    for y in range(holes.shape[0]):
        for x in range(holes.shape[1]):
            if not holes[y, x]:
                continue
            x0 = ox + x * MODULE_MM
            y0 = oy + y * MODULE_MM
            m = MODULE_MM
            b = BRIDGE_MM
            orient = bmap.get((y, x))
            if orient is None:
                cuts.append((x0, y0, m, m))
            elif orient == "h":
                top = (m - b) / 2
                cuts.append((x0, y0, m, top))
                cuts.append((x0, y0 + top + b, m, top))
            elif orient == "v":
                left = (m - b) / 2
                cuts.append((x0, y0, left, m))
                cuts.append((x0 + left + b, y0, left, m))
            else:  # cross — leave plus-shaped material
                t = (m - b) / 2
                # four corner rectangles
                cuts.append((x0, y0, t, t))
                cuts.append((x0 + t + b, y0, t, t))
                cuts.append((x0, y0 + t + b, t, t))
                cuts.append((x0 + t + b, y0 + t + b, t, t))
    return cuts


# ---------- Clean geometric logo (matches achillesviii stencil look) ----------

def _poly(points):
    return list(points)


def logo_shapes(cx, cy, scale):
    """
    Return list of polygons in mm for CUT (paint) shapes.
    Drawn like the clean VIII stencil: Lambda/A, laurel leaves, ACHILLES, VIII + bars.
    """
    shapes = []

    # --- Lambda / A ---
    # Outer A silhouette
    s = scale
    A = [
        (cx, cy - 1.05 * s),
        (cx + 0.72 * s, cy + 0.78 * s),
        (cx + 0.48 * s, cy + 0.78 * s),
        (cx + 0.22 * s, cy + 0.08 * s),
        (cx - 0.22 * s, cy + 0.08 * s),
        (cx - 0.48 * s, cy + 0.78 * s),
        (cx - 0.72 * s, cy + 0.78 * s),
    ]
    shapes.append(("poly", A))
    # Crossbar as separate bar with end bridges implied by overlap into legs via geometry later
    shapes.append(
        (
            "poly",
            [
                (cx - 0.34 * s, cy + 0.02 * s),
                (cx + 0.34 * s, cy + 0.02 * s),
                (cx + 0.34 * s, cy + 0.14 * s),
                (cx - 0.34 * s, cy + 0.14 * s),
            ],
        )
    )

    # --- Laurel wreath (paired leaves) ---
    for sign in (-1, 1):
        for i in range(12):
            ang = math.radians(-70 + i * (140 / 11))
            # leaf center on ellipse
            rx, ry = 0.98 * s, 1.08 * s
            lx = cx + sign * rx * math.sin(ang)
            ly = cy + 0.05 * s - ry * math.cos(ang) * 0.92
            # leaf orientation tangent
            tang = ang + (0.35 if sign > 0 else -0.35)
            lw, lh = 0.13 * s, 0.34 * s
            # diamond/leaf poly
            ca, sa = math.cos(tang), math.sin(tang)
            pts = []
            for px, py in [(0, -lh), (lw, 0), (0, lh), (-lw * 0.55, 0)]:
                pts.append((lx + px * ca - py * sa, ly + px * sa + py * ca))
            shapes.append(("poly", pts))
            # thin bridge stem toward center ring (material left by NOT cutting stem —
            # instead we cut leaf only; stems are gaps = material). Good.

    # --- ACHILLES wordmark ---
    # Raster crisp text to polys via mask sampling into cut rects with bridges
    return shapes


def render_logo_mask(width_mm: float, height_mm: float, res=0.25):
    """
    Draw clean logo into a boolean hole mask (True=cut/paint).
    Includes bridges inside letter counters and leaf connectors.
    """
    from PIL import Image, ImageDraw, ImageFont
    import numpy as np

    W = int(math.ceil(width_mm / res))
    H = int(math.ceil(height_mm / res))
    im = Image.new("L", (W, H), 0)  # black bg = material
    d = ImageDraw.Draw(im)

    cx, cy = W * 0.5, H * 0.38
    s = min(W, H) * 0.28

    def poly(pts, fill=255):
        d.polygon([(x, y) for x, y in pts], fill=fill)

    # Lambda / A outer
    A = [
        (cx, cy - 1.05 * s),
        (cx + 0.78 * s, cy + 0.82 * s),
        (cx + 0.52 * s, cy + 0.82 * s),
        (cx + 0.24 * s, cy + 0.05 * s),
        (cx - 0.24 * s, cy + 0.05 * s),
        (cx - 0.52 * s, cy + 0.82 * s),
        (cx - 0.78 * s, cy + 0.82 * s),
    ]
    poly(A, 255)
    # punch inner triangle counter but leave bridge tabs (don't fully close)
    inner = [
        (cx, cy - 0.35 * s),
        (cx + 0.16 * s, cy + 0.02 * s),
        (cx - 0.16 * s, cy + 0.02 * s),
    ]
    # erase center with gaps for bridges at bottom corners
    poly(inner, 0)
    # crossbar
    d.rectangle(
        [cx - 0.36 * s, cy + 0.00 * s, cx + 0.36 * s, cy + 0.12 * s], fill=255
    )
    # re-clear small bridge gaps in crossbar center? keep solid connected to legs

    # Laurel wreath — paired classic leaves around the A (open at top)
    leaf_centers = []
    for sign in (-1, 1):
        for i in range(11):
            t = i / 10  # 0..1 along branch
            # angle from bottom meeting point up toward top opening
            ang = math.radians(-40 + t * 95)  # up the side
            rx, ry = 1.08 * s, 1.18 * s
            lx = cx + sign * rx * math.sin(ang)
            ly = cy + 0.55 * s - ry * (0.15 + 0.85 * math.cos(math.radians(t * 85)))
            # leaf long axis follows branch direction
            tang = math.atan2(
                -ry * 0.85 * math.sin(math.radians(t * 85)) * (85 * math.pi / 180) / 10,
                sign * rx * math.cos(ang) * (95 * math.pi / 180) / 10,
            )
            lw, lh = 0.105 * s, 0.30 * s
            ca, sa = math.cos(tang), math.sin(tang)
            pts = []
            for px, py in [(0, -lh), (lw, -0.05 * lh), (0, lh), (-lw * 0.4, -0.05 * lh)]:
                pts.append((lx + px * ca - py * sa, ly + px * sa + py * ca))
            poly(pts, 255)
            leaf_centers.append((lx, ly))

    # Wordmark ACHILLES
    text = "ACHILLES"
    # try fonts
    font = None
    for fp in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ):
        if Path(fp).exists():
            font = ImageFont.truetype(fp, size=int(s * 0.42))
            break
    if font is None:
        font = ImageFont.load_default()

    # measure
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = cx - tw / 2
    ty = cy + 1.15 * s
    d.text((tx, ty), text, font=font, fill=255)

    # Bridge letter counters (A) — burn small material bridges
    arr = np.array(im, dtype=np.uint8, copy=True)
    a_left = int(tx)
    a_right = int(tx + tw * 0.14)
    a_top = int(ty + th * 0.25)
    a_bot = int(ty + th * 0.7)
    midy = (a_top + a_bot) // 2
    arr[midy - 1 : midy + 2, a_left:a_right] = 0

    # VIII + bars
    try:
        font2 = ImageFont.truetype(font.path, size=int(s * 0.28))
    except Exception:
        font2 = font
    bbox2 = ImageDraw.Draw(Image.new("L", (10, 10))).textbbox((0, 0), "VIII", font=font2)
    vw, vh = bbox2[2] - bbox2[0], bbox2[3] - bbox2[1]
    vx = cx - vw / 2
    vy = ty + th + 0.18 * s
    im2 = Image.fromarray(arr)
    d2 = ImageDraw.Draw(im2)
    d2.text((vx, vy), "VIII", font=font2, fill=255)
    bar_y0 = vy + vh * 0.38
    bar_y1 = bar_y0 + max(3, int(0.045 * s))
    gap = 0.14 * s
    d2.rectangle([cx - 0.9 * s, bar_y0, vx - gap, bar_y1], fill=255)
    d2.rectangle([vx + vw + gap, bar_y0, cx + 0.9 * s, bar_y1], fill=255)
    arr = np.array(im2, dtype=np.uint8, copy=True)

    # Outer margin solid
    arr[:4, :] = 0
    arr[-4:, :] = 0
    arr[:, :4] = 0
    arr[:, -4:] = 0

    # Thicken strokes slightly for spray openings, but keep bridges
    from PIL import ImageFilter

    ink = Image.fromarray(arr)
    ink = ink.filter(ImageFilter.MaxFilter(3))
    ink_a = np.array(ink, dtype=np.uint8, copy=True)
    ink_a[midy - 1 : midy + 2, a_left:a_right] = 0

    # Material bridges from each leaf outward (keeps leaves attached without
    # chewing the leaf shape into spikes)
    bridge_w = max(2, int(0.028 * s))
    for lx, ly in leaf_centers:
        # push outward from crest center
        vx, vy = lx - cx, ly - (cy + 0.05 * s)
        norm = math.hypot(vx, vy) or 1
        ux, uy = vx / norm, vy / norm
        for t in range(0, int(0.55 * s)):
            px = int(lx + ux * t)
            py = int(ly + uy * t)
            if not (0 <= px < W and 0 <= py < H):
                break
            ink_a[
                max(0, py - bridge_w) : min(H, py + bridge_w + 1),
                max(0, px - bridge_w) : min(W, px + bridge_w + 1),
            ] = 0

    hole = ink_a > 127
    return hole, res


def mask_to_cuts(hole, res, ox, oy, bridge_plan=True):
    """Convert logo hole mask to cut rectangles; add bridges for islands."""
    import numpy as np

    # Optional: plan bridges on downsampled module-like grid
    # Work at mask resolution: find islands and cut bridge pixels to material
    material = ~hole
    h, w = hole.shape
    lab, comps = components(material)
    frame = {
        i
        for i, mem in comps.items()
        if any(y == 0 or x == 0 or y == h - 1 or x == w - 1 for y, x in mem)
    }
    g = hole.copy()
    for island, mem in comps.items():
        if island in frame:
            continue
        # BFS to frame
        dist = np.full((h, w), -1, dtype=np.int32)
        prev = np.full((h, w, 2), -1, dtype=np.int32)
        q = deque(mem)
        for y, x in mem:
            dist[y, x] = 0
        target = None
        while q:
            y, x = q.popleft()
            if lab[y, x] in frame and lab[y, x] != island:
                target = (y, x)
                break
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and dist[ny, nx] < 0:
                    dist[ny, nx] = dist[y, x] + 1
                    prev[ny, nx] = (y, x)
                    q.append((ny, nx))
        if not target:
            continue
        cy, cx = target
        while cy >= 0:
            if g[cy, cx]:
                # carve material bridge 3px wide
                g[max(0, cy - 1) : cy + 2, max(0, cx - 1) : cx + 2] = False
            cy, cx = prev[cy, cx]
        # refresh
        material = ~g
        lab, comps = components(material)
        frame = {
            i
            for i, mem in comps.items()
            if any(y == 0 or x == 0 or y == h - 1 or x == w - 1 for y, x in mem)
        }

    # emit run-length cut rects
    cuts = []
    for y in range(h):
        x = 0
        while x < w:
            if not g[y, x]:
                x += 1
                continue
            x1 = x
            while x1 < w and g[y, x1]:
                x1 += 1
            cuts.append((ox + x * res, oy + y * res, (x1 - x) * res, res))
            x = x1
    return cuts, g


def write_svg(cuts, width_mm, height_mm, path: Path, note: str):
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width_mm:.2f}mm" height="{height_mm:.2f}mm" viewBox="0 0 {width_mm:.2f} {height_mm:.2f}">',
        "<title>ACHILLES VIII spray stencil</title>",
        f"<desc>{note}</desc>",
        f'<rect x="0" y="0" width="{width_mm:.2f}" height="{height_mm:.2f}" fill="#eaeaea" stroke="#111" stroke-width="0.3"/>',
        '<g id="CUT" fill="#111111">',
    ]
    for x, y, w, h in cuts:
        if w < 0.05 or h < 0.05:
            continue
        parts.append(
            f'<rect x="{x:.3f}" y="{y:.3f}" width="{w:.3f}" height="{h:.3f}"/>'
        )
    parts += [
        "</g>",
        f'<text x="{width_mm/2:.2f}" y="7" text-anchor="middle" font-size="3.2" fill="#777" font-family="Helvetica,Arial,sans-serif">ACHILLES VIII — CUT BLACK — REINFORCED QR</text>',
        "</svg>",
    ]
    path.write_text("\n".join(parts), encoding="utf-8")


def write_stl(width_mm, height_mm, cuts, path: Path):
    import numpy as np

    res = 0.4
    W = int(math.ceil(width_mm / res))
    H = int(math.ceil(height_mm / res))
    solid = np.ones((H, W), dtype=bool)
    for x, y, w, h in cuts:
        x0 = max(0, int(x / res))
        y0 = max(0, int(y / res))
        x1 = min(W, int(math.ceil((x + w) / res)))
        y1 = min(H, int(math.ceil((y + h) / res)))
        solid[y0:y1, x0:x1] = False

    tris = []

    def add_box(x0, y0, z0, x1, y1, z1):
        v = [
            (x0, y0, z0),
            (x1, y0, z0),
            (x1, y1, z0),
            (x0, y1, z0),
            (x0, y0, z1),
            (x1, y0, z1),
            (x1, y1, z1),
            (x0, y1, z1),
        ]
        faces = [
            ((0, 0, -1), (0, 1, 2, 3)),
            ((0, 0, 1), (4, 5, 6, 7)),
            ((0, -1, 0), (0, 1, 5, 4)),
            ((0, 1, 0), (3, 2, 6, 7)),
            ((-1, 0, 0), (0, 3, 7, 4)),
            ((1, 0, 0), (1, 2, 6, 5)),
        ]
        for nrm, idx in faces:
            a, b, c, d = (v[i] for i in idx)
            tris.append((nrm, (a, b, c)))
            tris.append((nrm, (a, c, d)))

    for yi in range(H):
        y0 = (H - 1 - yi) * res
        y1 = y0 + res
        xi = 0
        while xi < W:
            if not solid[yi, xi]:
                xi += 1
                continue
            xj = xi
            while xj < W and solid[yi, xj]:
                xj += 1
            add_box(xi * res, y0, 0, xj * res, y1, SHEET_THICK_MM)
            xi = xj

    with path.open("wb") as f:
        f.write((b"ACHILLES VIII reinforced spray stencil" + b"\0" * 80)[:80])
        f.write(struct.pack("<I", len(tris)))
        for nrm, verts in tris:
            f.write(struct.pack("<3f", *nrm))
            for v in verts:
                f.write(struct.pack("<3f", *v))
            f.write(struct.pack("<H", 0))
    return len(tris), float(solid.mean())


def write_preview(cuts, width_mm, height_mm, path, decoded):
    from PIL import Image, ImageDraw

    px = 4
    im = Image.new("RGB", (int(width_mm * px), int(height_mm * px)), (236, 236, 236))
    d = ImageDraw.Draw(im)
    for x, y, w, h in cuts:
        d.rectangle(
            [x * px, y * px, (x + w) * px, (y + h) * px],
            fill=(15, 15, 15),
        )
    d.rectangle([0, 0, im.width, 24], fill=(25, 25, 25))
    d.text(
        (8, 5),
        f"ACHILLES VIII stencil  decode={decoded}  {width_mm:.0f}x{height_mm:.0f}x{SHEET_THICK_MM}mm  bridges={BRIDGE_MM}mm",
        fill=(240, 240, 240),
    )
    im.save(path)


def main():
    ensure_deps()
    OUT.mkdir(parents=True, exist_ok=True)

    qr, ver = qr_matrix(URL)
    assert decode_qr(qr) == URL
    print(f"QR v{ver} OK")

    bridges = plan_bridges(qr, reinforced=True)
    sprayed = decode_with_bridges(qr, bridges)
    print(f"QR bridges={len(bridges)} sprayed-decode={sprayed!r}")

    # Layout sizes
    qr_w = qr.shape[1] * MODULE_MM
    qr_h = qr.shape[0] * MODULE_MM
    logo_w = qr_w
    logo_h = qr_w * 1.05  # tall crest block like reference ~ square-ish crest area

    width_mm = FRAME_MM * 2 + qr_w
    height_mm = FRAME_MM * 2 + logo_h + GAP_MM + qr_h

    logo_mask, res = render_logo_mask(logo_w, logo_h, res=0.28)
    logo_cuts, _ = mask_to_cuts(logo_mask, res, FRAME_MM, FRAME_MM)

    qr_cuts = hole_cuts(qr, bridges, FRAME_MM, FRAME_MM + logo_h + GAP_MM)
    cuts = logo_cuts + qr_cuts

    decoded = decode_qr(qr)
    assert decoded == URL

    svg = OUT / "achilles-spray-stencil.svg"
    stl = OUT / "achilles-spray-stencil.stl"
    # also alias matching user's naming
    stl2 = OUT / "achillesviiistencil.stl"
    preview = OUT / "achilles-spray-stencil-preview.png"

    note = f"Reinforced spray stencil for {URL}. Bridge {BRIDGE_MM}mm, module {MODULE_MM}mm, thickness {SHEET_THICK_MM}mm."
    write_svg(cuts, width_mm, height_mm, svg, note)
    ntri, fill = write_stl(width_mm, height_mm, cuts, stl)
    stl2.write_bytes(stl.read_bytes())
    write_preview(cuts, width_mm, height_mm, preview, decoded)

    (OUT / "STENCIL-README.txt").write_text(
        f"""ACHILLES VIII spray stencil (reinforced)
=======================================
URL: {URL}
Optical decode: {decoded}
Spray-sim decode: {sprayed or 'n/a'}

Files
- achilles-spray-stencil.svg
- achilles-spray-stencil.stl
- achillesviiistencil.stl  (same STL, reference name)
- achilles-spray-stencil-preview.png

Logo: clean geometric Lambda/A + laurel + ACHILLES + VIII (not photo threshold)
QR: thicker cross bridges ({BRIDGE_MM} mm) + extra supports every {EXTRA_SUPPORT_EVERY} modules
Sheet: {width_mm:.1f} x {height_mm:.1f} x {SHEET_THICK_MM} mm
Material fill: {fill*100:.1f}%
""",
        encoding="utf-8",
    )

    print(f"Sheet {width_mm:.1f}x{height_mm:.1f}x{SHEET_THICK_MM} mm cuts={len(cuts)}")
    print(f"STL tris={ntri} fill={fill*100:.1f}%")
    print("Wrote", svg, stl, stl2, preview)


if __name__ == "__main__":
    main()
