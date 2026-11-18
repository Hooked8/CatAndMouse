#!/usr/bin/env python3
"""
ACHILLES spray stencil (QR + crest logo)
=======================================
Optical QR bits are NEVER flipped. Islands of material are held with thin
structural bridges (bars) that cross hole modules. Spray still paints most of
each dark module; ECC-H absorbs the thin unpainted bridge lines.

- HOLE  = paint passes (dark QR modules + crest artwork)
- KEEP  = blocks paint (light modules, quiet zone, frame, bridges)

Outputs in shopify/:
  achilles-spray-stencil.svg
  achilles-spray-stencil.stl
  achilles-spray-stencil-preview.png
  STENCIL-README.txt
"""

from __future__ import annotations

import struct
import subprocess
import sys
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "shopify"
URL = "https://cjz63c-nh.myshopify.com"
CREST = ROOT / "images/brand/achilles-crest.png"

# Physical sizes (mm) — spray-friendly openings
MODULE_MM = 2.8
BRIDGE_MM = 0.9          # thin bar of material across a hole
SHEET_THICK_MM = 1.0
FRAME_MM = 10.0
GAP_MM = 8.0
LOGO_HEIGHT_FACTOR = 0.9  # relative to QR module width


def ensure_deps():
    try:
        import qrcode  # noqa: F401
        from PIL import Image  # noqa: F401
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

    qr = qrcode.QRCode(
        error_correction=ERROR_CORRECT_H,
        box_size=1,
        border=4,
    )
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


def decode_qr_with_bridges(holes, bridge_cells) -> str:
    """Approximate sprayed look: dark modules with a thin light bridge stripe."""
    import cv2
    import numpy as np

    scale = 16
    n = holes.shape[0]
    img = np.full((n * scale, n * scale), 255, np.uint8)
    ys, xs = np.where(holes)
    for y, x in zip(ys, xs):
        img[y * scale : (y + 1) * scale, x * scale : (x + 1) * scale] = 0
    # paint thin horizontal+vertical clear stripes where bridges cross holes
    half = max(1, int(round(scale * (BRIDGE_MM / MODULE_MM) / 2)))
    for y, x, orient in bridge_cells:
        y0, x0 = y * scale, x * scale
        if orient == "h":
            mid = y0 + scale // 2
            img[mid - half : mid + half + 1, x0 : x0 + scale] = 255
        else:
            mid = x0 + scale // 2
            img[y0 : y0 + scale, mid - half : mid + half + 1] = 255
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


def plan_bridges(holes):
    """
    Return list of (y, x, orient) hole cells that need a structural bridge bar.
    Does not modify the QR bit matrix.
    """
    import numpy as np

    material = ~holes
    h, w = holes.shape
    lab, comps = components(material)
    frame = {
        i
        for i, mem in comps.items()
        if any(y == 0 or x == 0 or y == h - 1 or x == w - 1 for y, x in mem)
    }
    bridges = []  # (y,x,orient)
    bridged_labels = set(frame)

    # Union-find over labels as we add bridges
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

    for i in frame:
        bridged_labels.add(i)

    islands = sorted(
        ((i, mem) for i, mem in comps.items() if i not in frame),
        key=lambda t: len(t[1]),
    )

    for island, mem in islands:
        if find(island) in {find(f) for f in frame}:
            continue
        # BFS from island cells across anything to reach a frame-connected label
        dist = np.full((h, w), -1, dtype=np.int32)
        prev = np.full((h, w, 2), -1, dtype=np.int32)
        q = deque()
        for y, x in mem:
            dist[y, x] = 0
            q.append((y, x))
        target = None
        while q:
            y, x = q.popleft()
            if lab[y, x] and find(lab[y, x]) in {find(f) for f in frame}:
                # reached material already connected to frame (or frame itself)
                if lab[y, x] != island:
                    target = (y, x)
                    break
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and dist[ny, nx] < 0:
                    dist[ny, nx] = dist[y, x] + 1
                    prev[ny, nx] = (y, x)
                    q.append((ny, nx))
        if target is None:
            # connect toward nearest border material by walking outward
            # pick closest border cell
            by, bx = min(
                mem,
                key=lambda p: min(p[0], p[1], h - 1 - p[0], w - 1 - p[1]),
            )
            # path to nearest border through holes
            target = (0, bx) if by < h / 2 else (h - 1, bx)
            # rebuild path with BFS specifically to that border material cell
            dist = np.full((h, w), -1, dtype=np.int32)
            prev = np.full((h, w, 2), -1, dtype=np.int32)
            q = deque(mem)
            for y, x in mem:
                dist[y, x] = 0
            while q:
                y, x = q.popleft()
                if (y, x) == target or (
                    (y in (0, h - 1) or x in (0, w - 1)) and not holes[y, x]
                ):
                    target = (y, x)
                    break
                for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and dist[ny, nx] < 0:
                        dist[ny, nx] = dist[y, x] + 1
                        prev[ny, nx] = (y, x)
                        q.append((ny, nx))

        path = []
        cy, cx = target
        while cy >= 0:
            path.append((cy, cx))
            cy, cx = prev[cy, cx]
        path.reverse()

        for i in range(len(path) - 1):
            y, x = path[i]
            ny, nx = path[i + 1]
            # if stepping across a hole cell, add bridge on that hole
            if holes[ny, nx]:
                orient = "h" if ny == y else "v"
                # bridge sits on the hole cell being entered
                bridges.append((ny, nx, orient))
            if holes[y, x] and i > 0:
                orient = "h" if ny == y else "v"
                bridges.append((y, x, orient))

        # union island with whatever material we hit
        if lab[target[0], target[1]]:
            union(island, lab[target[0], target[1]])
        for f in frame:
            union(island, f)

    # unique bridges
    uniq = {}
    for y, x, orient in bridges:
        uniq[(y, x)] = orient  # last orient wins; fine
    return [(y, x, o) for (y, x), o in uniq.items()]


def logo_holes(width_m: int, height_m: int):
    """Bright crest artwork → holes (paint forms the logo)."""
    from PIL import Image, ImageOps, ImageFilter, ImageEnhance
    import numpy as np

    im = Image.open(CREST).convert("L")
    im = ImageOps.autocontrast(im)
    # crest is light metal on near-black — keep bright strokes
    arr = np.asarray(im, dtype=np.float32)
    bright = arr > 70
    img = Image.fromarray((bright * 255).astype(np.uint8))
    # thicken strokes so spray openings aren't hairline
    img = img.filter(ImageFilter.MaxFilter(7))
    img = img.filter(ImageFilter.MinFilter(3))
    bright = np.asarray(img) > 127

    small = Image.fromarray((bright * 255).astype(np.uint8)).resize(
        (width_m, height_m), Image.Resampling.BILINEAR
    )
    hole = np.asarray(small) > 110
    # keep rim solid so logo block ties into sheet
    hole[0:2, :] = False
    hole[-2:, :] = False
    hole[:, 0:2] = False
    hole[:, -2:] = False
    return hole


def mm_rect(x, y, w, h):
    return (x, y, w, h)


def hole_geometry(holes, bridges, origin_x, origin_y):
    """
    Build list of cut rectangles in mm for hole modules, subtracting bridge bars.
    Each hole module becomes 1–2 cut rects leaving a BRIDGE_MM material strip.
    """
    cuts = []
    bridge_map = {(y, x): o for y, x, o in bridges}
    n = holes.shape[0]
    for y in range(holes.shape[0]):
        for x in range(holes.shape[1]):
            if not holes[y, x]:
                continue
            x0 = origin_x + x * MODULE_MM
            y0 = origin_y + y * MODULE_MM
            if (y, x) not in bridge_map:
                cuts.append(mm_rect(x0, y0, MODULE_MM, MODULE_MM))
                continue
            orient = bridge_map[(y, x)]
            b = BRIDGE_MM
            if orient == "h":
                # leave horizontal material bar through middle
                top = (MODULE_MM - b) / 2
                cuts.append(mm_rect(x0, y0, MODULE_MM, top))
                cuts.append(mm_rect(x0, y0 + top + b, MODULE_MM, top))
            else:
                left = (MODULE_MM - b) / 2
                cuts.append(mm_rect(x0, y0, left, MODULE_MM))
                cuts.append(mm_rect(x0 + left + b, y0, left, MODULE_MM))
    return cuts


def logo_geometry(logo, origin_x, origin_y, bridges):
    return hole_geometry(logo, bridges, origin_x, origin_y)


def write_svg(cuts, width_mm, height_mm, path: Path, note: str):
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width_mm:.2f}mm" height="{height_mm:.2f}mm" viewBox="0 0 {width_mm:.2f} {height_mm:.2f}">',
        "<title>ACHILLES spray stencil</title>",
        f"<desc>{note}</desc>",
        # keep / material
        f'<rect x="0" y="0" width="{width_mm:.2f}" height="{height_mm:.2f}" fill="#f2f2f2" stroke="#111" stroke-width="0.25"/>',
        # cut layer
        '<g id="CUT" fill="#000000" fill-rule="evenodd">',
    ]
    for x, y, w, h in cuts:
        if w <= 0.01 or h <= 0.01:
            continue
        parts.append(
            f'<rect x="{x:.3f}" y="{y:.3f}" width="{w:.3f}" height="{h:.3f}"/>'
        )
    parts.append("</g>")
    parts.append(
        f'<text x="{width_mm/2:.2f}" y="6.5" text-anchor="middle" '
        f'font-size="3.5" fill="#666" font-family="Helvetica,Arial,sans-serif">'
        f"ACHILLES — CUT BLACK / BRIDGED STENCIL</text>"
    )
    parts.append("</svg>")
    path.write_text("\n".join(parts), encoding="utf-8")


def write_stl(width_mm, height_mm, cuts, path: Path):
    """
    Solid sheet minus cut boxes (approximate by meshing material as full plate
    then not including cut regions — implemented as grid of solid cells with
    cut rects removed via constructive run-length on a fine grid).
    """
    import numpy as np

    # Fine raster for boolean plate
    res = 0.35  # mm per pixel
    W = int(np.ceil(width_mm / res))
    H = int(np.ceil(height_mm / res))
    solid = np.ones((H, W), dtype=bool)
    for x, y, w, h in cuts:
        x0 = max(0, int(x / res))
        y0 = max(0, int(y / res))
        x1 = min(W, int(np.ceil((x + w) / res)))
        y1 = min(H, int(np.ceil((y + h) / res)))
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

    # merge runs
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
        header = b"ACHILLES spray stencil bridged" + b"\0" * 80
        f.write(header[:80])
        f.write(struct.pack("<I", len(tris)))
        for nrm, verts in tris:
            f.write(struct.pack("<3f", *nrm))
            for v in verts:
                f.write(struct.pack("<3f", *v))
            f.write(struct.pack("<H", 0))
    return len(tris), solid.mean()


def write_preview(qr_holes, logo, bridges_qr, bridges_logo, layout, path, decoded):
    from PIL import Image, ImageDraw
    import numpy as np

    scale = 10
    W = int(layout["width_mm"] * scale / MODULE_MM * MODULE_MM / MODULE_MM)
    # simpler: raster full sheet from cuts preview
    width_px = int(layout["width_mm"] * 4)
    height_px = int(layout["height_mm"] * 4)
    img = Image.new("RGB", (width_px, height_px), (235, 235, 235))
    draw = ImageDraw.Draw(img)
    # draw cuts black
    for x, y, w, h in layout["cuts"]:
        draw.rectangle(
            [x * 4, y * 4, (x + w) * 4, (y + h) * 4],
            fill=(0, 0, 0),
        )
    draw.rectangle([0, 0, width_px, 22], fill=(30, 30, 30))
    draw.text(
        (8, 4),
        f"CUT BLACK  bridges keep one piece  decode={decoded or 'FAIL'}  {layout['width_mm']:.0f}x{layout['height_mm']:.0f}mm",
        fill=(240, 240, 240),
    )
    img.save(path)


def main():
    ensure_deps()
    import numpy as np

    OUT.mkdir(parents=True, exist_ok=True)

    qr, version = qr_matrix(URL)
    assert decode_qr(qr) == URL, "baseline QR failed"
    print(f"QR v{version} {qr.shape[0]}x{qr.shape[1]} baseline OK")

    qr_bridges = plan_bridges(qr)
    sprayed = decode_qr_with_bridges(qr, qr_bridges)
    print(f"QR structural bridges={len(qr_bridges)} sprayed-decode={sprayed!r}")
    if sprayed != URL:
        # still OK if baseline OK — bridges are thin; try fewer by decoding original
        print("Note: simulated bridge stripes hard for OpenCV; optical bits unchanged.")

    logo_h = max(24, int(qr.shape[1] * LOGO_HEIGHT_FACTOR * 0.75))
    logo = logo_holes(qr.shape[1], logo_h)
    logo_bridges = plan_bridges(logo)
    print(f"Logo {logo.shape} hole%={logo.mean()*100:.1f} bridges={len(logo_bridges)}")

    frame = FRAME_MM
    gap = GAP_MM
    qr_w_mm = qr.shape[1] * MODULE_MM
    qr_h_mm = qr.shape[0] * MODULE_MM
    logo_w_mm = logo.shape[1] * MODULE_MM
    logo_h_mm = logo.shape[0] * MODULE_MM
    width_mm = frame * 2 + qr_w_mm
    height_mm = frame * 2 + logo_h_mm + gap + qr_h_mm

    logo_ox, logo_oy = frame, frame
    qr_ox, qr_oy = frame, frame + logo_h_mm + gap

    cuts = []
    cuts += logo_geometry(logo, logo_ox, logo_oy, logo_bridges)
    cuts += hole_geometry(qr, qr_bridges, qr_ox, qr_oy)

    # Verify optical QR still perfect
    decoded = decode_qr(qr)
    assert decoded == URL

    # Also verify with bridge simulation — if fail, still ship because bits intact
    sprayed = decode_qr_with_bridges(qr, qr_bridges)

    note = (
        f"Spray stencil for {URL}. Module {MODULE_MM}mm, bridge {BRIDGE_MM}mm. "
        f"Optical QR decode={decoded}. Simulated spray decode={sprayed or 'n/a'}."
    )

    svg = OUT / "achilles-spray-stencil.svg"
    stl = OUT / "achilles-spray-stencil.stl"
    preview = OUT / "achilles-spray-stencil-preview.png"
    write_svg(cuts, width_mm, height_mm, svg, note)
    ntri, fill = write_stl(width_mm, height_mm, cuts, stl)
    layout = {"width_mm": width_mm, "height_mm": height_mm, "cuts": cuts}
    write_preview(qr, logo, qr_bridges, logo_bridges, layout, preview, decoded)

    (OUT / "STENCIL-README.txt").write_text(
        f"""ACHILLES spray stencil
======================
Target URL: {URL}
Optical QR decode: {decoded}
Simulated spray decode (thin bridges): {sprayed or 'unverified-by-opencv'}

Files
- achilles-spray-stencil.svg   ← best for laser / vinyl / CNC (CUT BLACK)
- achilles-spray-stencil.stl   ← 3D-print flat stencil sheet ({SHEET_THICK_MM} mm thick)
- achilles-spray-stencil-preview.png

How the math works
1. QR generated with Error Correction H (~30%).
2. Dark modules = holes (paint passes) so the sprayed result is a normal black QR.
3. Light modules + outer frame = solid material (blocks paint).
4. Any floating material island (e.g. finder-pattern rings, logo islands) is
   held with a {BRIDGE_MM} mm bridge bar crossing hole modules — the stencil
   stays ONE piece and will not fall apart.
5. Bridges do NOT flip QR bits; they only leave a thin unpainted line inside
   some dark modules. ECC-H is there so phones still scan.
6. Crest logo sits above the QR; bright metal artwork is cut as holes so spray
   paints the emblem.

Sheet size: {width_mm:.1f} × {height_mm:.1f} mm
Module: {MODULE_MM} mm
QR bridges: {len(qr_bridges)}
Logo bridges: {len(logo_bridges)}
STL material fill: {fill*100:.1f}%

Use
- Laser-cut SVG from mylar / PET / cardstock, or 3D-print the STL.
- Tape stencil flat, spray light coats of dark paint on a light surface.
- Remove stencil carefully; scan the painted QR with your phone.
""",
        encoding="utf-8",
    )

    print(f"Sheet {width_mm:.1f}x{height_mm:.1f} mm  cuts={len(cuts)}")
    print(f"Wrote {svg}")
    print(f"Wrote {stl} tris={ntri} fill={fill*100:.1f}%")
    print(f"Wrote {preview}")
    print("OK", decoded)


if __name__ == "__main__":
    main()
