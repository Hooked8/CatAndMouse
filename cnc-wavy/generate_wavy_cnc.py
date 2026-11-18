#!/usr/bin/env python3
"""Generate ACHILLES wavy skate-deck CNC packs for Utah Tech Stinger III / Fusion 360 / WinCNC."""

from __future__ import annotations

import math
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
OUT_SVG = ROOT / "svg"
OUT_DXF = ROOT / "dxf"
OUT_STL = ROOT / "stl"
OUT_HM = ROOT / "heightmaps"
OUT_PREV = ROOT / "previews"
OUT_SETUP = ROOT / "setup"
PACK = ROOT / "ACHILLES_WAVY_Stinger_Fusion360_Pack.zip"

# Standard popsicle deck (inches) — Utah Tech Stinger / Fusion units = inches
DECK_W = 8.5
DECK_L = 32.0
MARGIN = 0.35


def deck_outline(n: int = 180) -> list[tuple[float, float]]:
    """Rounded skateboard outline centered at origin, X along length, Y along width."""
    hw, hl = DECK_W / 2 - 0.05, DECK_L / 2 - 0.05
    tip_r = 2.15
    pts: list[tuple[float, float]] = []
    # Parametric rounded rectangle with circular tips
    for i in range(n):
        t = 2 * math.pi * i / n
        # Superellipse-ish deck
        c, s = math.cos(t), math.sin(t)
        # Stretch tip rounding
        rx = hl - tip_r + tip_r
        ry = hw
        # Blend tip circles
        x = rx * (abs(c) ** 0.85) * (1 if c >= 0 else -1)
        y = ry * (abs(s) ** 0.92) * (1 if s >= 0 else -1)
        # Soften nose/tail
        if abs(x) > hl - tip_r:
            side = 1 if x > 0 else -1
            local = x - side * (hl - tip_r)
            y_max = math.sqrt(max(0.0, tip_r**2 - local**2)) * (hw / tip_r) * 0.98
            y = max(-y_max, min(y_max, y))
        pts.append((x, y))
    return pts


def inside_deck(x: float, y: float) -> bool:
    hw, hl = DECK_W / 2 - MARGIN, DECK_L / 2 - MARGIN
    tip_r = 2.0
    if abs(y) > hw:
        return False
    if abs(x) <= hl - tip_r:
        return abs(y) <= hw
    side = 1 if x > 0 else -1
    local = x - side * (hl - tip_r)
    if abs(local) > tip_r:
        return False
    y_max = math.sqrt(max(0.0, tip_r**2 - local**2)) * (hw / tip_r)
    return abs(y) <= y_max


def poly_to_svg_path(pts: list[tuple[float, float]], close: bool = True) -> str:
    if not pts:
        return ""
    # SVG uses inches; map board coords (x along length, y width) → svg (x right, y down)
    # Shift so top-left of viewBox is 0,0 with origin at board center
    def sx(x: float, y: float) -> tuple[float, float]:
        return (x + DECK_L / 2, DECK_W / 2 - y)

    d = [f"M {sx(*pts[0])[0]:.4f},{sx(*pts[0])[1]:.4f}"]
    for p in pts[1:]:
        d.append(f"L {sx(*p)[0]:.4f},{sx(*p)[1]:.4f}")
    if close:
        d.append("Z")
    return " ".join(d)


def wavy_topo_paths(
    spacing: float = 0.18,
    amp: float = 0.55,
    freq: float = 0.55,
    seed: int = 1,
    avoid_rects: list[tuple[float, float, float, float]] | None = None,
) -> list[list[tuple[float, float]]]:
    """Horizontal-ish topographic wave contours along deck length."""
    rng = np.random.default_rng(seed)
    avoid_rects = avoid_rects or []
    paths: list[list[tuple[float, float]]] = []
    y0 = -DECK_W / 2 + MARGIN
    y1 = DECK_W / 2 - MARGIN
    ys = np.arange(y0, y1 + 1e-9, spacing)
    for yi, yb in enumerate(ys):
        phase = rng.uniform(0, 2 * math.pi)
        amp_i = amp * (0.75 + 0.35 * math.sin(yi * 0.37 + seed))
        pts: list[tuple[float, float]] = []
        for x in np.linspace(-DECK_L / 2 + MARGIN, DECK_L / 2 - MARGIN, 420):
            # Multi-frequency organic wave
            y = (
                yb
                + amp_i * math.sin(freq * x + phase)
                + 0.22 * amp_i * math.sin(1.7 * freq * x + phase * 1.3)
                + 0.08 * amp_i * math.sin(3.1 * freq * x)
            )
            if not inside_deck(x, y):
                if len(pts) > 8:
                    paths.append(pts)
                pts = []
                continue
            skip = False
            for ax0, ay0, ax1, ay1 in avoid_rects:
                if ax0 <= x <= ax1 and ay0 <= y <= ay1:
                    skip = True
                    break
            if skip:
                if len(pts) > 8:
                    paths.append(pts)
                pts = []
                continue
            pts.append((float(x), float(y)))
        if len(pts) > 8:
            paths.append(pts)
    return paths


def diamond_grid_paths(step: float = 0.28) -> list[list[tuple[float, float]]]:
    paths: list[list[tuple[float, float]]] = []
    # Diagonal lines both directions
    for direction in (1, -1):
        for offset in np.arange(-DECK_L, DECK_L, step):
            pts: list[tuple[float, float]] = []
            for t in np.linspace(-DECK_L, DECK_L, 500):
                x = t
                y = direction * (t + offset) * 0.55
                # remap into board
                xx = x * 0.55
                yy = y
                if inside_deck(xx, yy):
                    # avoid center logo box
                    if abs(xx) < 2.4 and abs(yy) < 2.6:
                        if len(pts) > 4:
                            paths.append(pts)
                        pts = []
                        continue
                    pts.append((float(xx), float(yy)))
                else:
                    if len(pts) > 4:
                        paths.append(pts)
                    pts = []
            if len(pts) > 4:
                paths.append(pts)
    return paths


def circle_pts(cx: float, cy: float, r: float, n: int = 96) -> list[tuple[float, float]]:
    return [
        (cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n))
        for i in range(n)
    ]


def greek_key_ring(cx: float, cy: float, r: float, tooth: float = 0.18, n_keys: int = 24) -> list[list[tuple[float, float]]]:
    """Approximate Greek-key meander as short radial segments around a ring."""
    paths: list[list[tuple[float, float]]] = []
    for i in range(n_keys):
        a0 = 2 * math.pi * i / n_keys
        a1 = 2 * math.pi * (i + 0.45) / n_keys
        outer = [
            (cx + (r + tooth) * math.cos(a0), cy + (r + tooth) * math.sin(a0)),
            (cx + (r + tooth) * math.cos(a1), cy + (r + tooth) * math.sin(a1)),
            (cx + r * math.cos(a1), cy + r * math.sin(a1)),
            (cx + r * math.cos(a0), cy + r * math.sin(a0)),
        ]
        paths.append(outer)
    paths.append(circle_pts(cx, cy, r + tooth * 1.35))
    paths.append(circle_pts(cx, cy, r - 0.12))
    return paths


def labyrinth_paths(cx: float, cy: float, r: float = 1.55) -> list[list[tuple[float, float]]]:
    paths = greek_key_ring(cx, cy, r, tooth=0.16, n_keys=20)
    # Concentric maze rings with gaps
    for k, rr in enumerate(np.linspace(0.35, r - 0.28, 5)):
        ring = circle_pts(cx, cy, float(rr), n=72)
        # open a gap
        gap = 8
        start = (k * 11) % (len(ring) - gap)
        paths.append(ring[:start] + ring[start + gap :])
    # radial connectors
    for i in range(6):
        a = i * math.pi / 3 + 0.2
        paths.append(
            [
                (cx + 0.35 * math.cos(a), cy + 0.35 * math.sin(a)),
                (cx + (r - 0.35) * math.cos(a), cy + (r - 0.35) * math.sin(a)),
            ]
        )
    # pinecone-ish center (oval scales)
    for i, rr in enumerate([0.28, 0.20, 0.12]):
        paths.append(circle_pts(cx, cy + 0.02 * i, rr, n=40))
    return paths


def laurel_wreath(cx: float, cy: float, r: float = 1.35) -> list[list[tuple[float, float]]]:
    paths: list[list[tuple[float, float]]] = []
    for side in (-1, 1):
        for i in range(9):
            a = -math.pi / 2 + side * (0.25 + i * 0.28)
            lx = cx + r * math.cos(a)
            ly = cy + r * math.sin(a)
            # leaf ellipse approx as diamond
            tang = a + side * 0.15
            leaf = [
                (lx, ly),
                (lx + 0.28 * math.cos(tang) - 0.10 * math.sin(tang), ly + 0.28 * math.sin(tang) + 0.10 * math.cos(tang)),
                (lx + 0.55 * math.cos(tang), ly + 0.55 * math.sin(tang)),
                (lx + 0.28 * math.cos(tang) + 0.10 * math.sin(tang), ly + 0.28 * math.sin(tang) - 0.10 * math.cos(tang)),
            ]
            paths.append(leaf)
    return paths


def lambda_mark(cx: float, cy: float, s: float = 1.1) -> list[list[tuple[float, float]]]:
    # Bold Λ as two thick polylines (centerlines for V-carve)
    left = [(cx, cy + s * 0.85), (cx - s * 0.55, cy - s * 0.75)]
    right = [(cx, cy + s * 0.85), (cx + s * 0.55, cy - s * 0.75)]
    # parallel offsets for weight
    paths = [left, right]
    for dx in (-0.08, 0.08):
        paths.append([(p[0] + dx, p[1]) for p in left])
        paths.append([(p[0] + dx, p[1]) for p in right])
    return paths


def eye_of_horus(cx: float, cy: float, s: float = 1.5) -> list[list[tuple[float, float]]]:
    paths: list[list[tuple[float, float]]] = []
    # almond eye outline
    eye = []
    for i in range(60):
        t = 2 * math.pi * i / 60
        x = cx + s * 0.85 * math.cos(t)
        y = cy + s * 0.38 * math.sin(t) * (1.15 if math.sin(t) > 0 else 1.0)
        eye.append((x, y))
    paths.append(eye)
    paths.append(circle_pts(cx + s * 0.08, cy + s * 0.02, s * 0.22, n=40))
    paths.append(circle_pts(cx + s * 0.08, cy + s * 0.02, s * 0.08, n=24))
    # teardrop
    tear = [
        (cx + s * 0.05, cy - s * 0.35),
        (cx + s * 0.18, cy - s * 0.75),
        (cx - s * 0.05, cy - s * 0.95),
        (cx - s * 0.22, cy - s * 0.55),
    ]
    paths.append(tear)
    # spiral flourish
    spiral = []
    for i in range(40):
        a = i / 40 * 2.8
        rr = s * (0.15 + 0.35 * i / 40)
        spiral.append((cx - s * 0.55 - rr * math.cos(a), cy - s * 0.15 - rr * math.sin(a) * 0.7))
    paths.append(spiral)
    # brow
    paths.append(
        [
            (cx - s * 0.95, cy + s * 0.35),
            (cx - s * 0.2, cy + s * 0.55),
            (cx + s * 0.7, cy + s * 0.45),
        ]
    )
    return paths


def spartan_helmet(cx: float, cy: float, s: float = 1.35) -> list[list[tuple[float, float]]]:
    paths: list[list[tuple[float, float]]] = []
    # crest
    crest = []
    for i in range(30):
        t = i / 29
        x = cx - s * 0.15 + t * s * 0.05
        y = cy + s * 0.95 - t * 0.1
        crest.append((x + 0.35 * s * math.sin(t * math.pi), y))
    for i in range(30):
        t = 1 - i / 29
        x = cx - s * 0.15 + t * s * 0.05
        y = cy + s * 0.95 - t * 0.1
        crest.append((x - 0.05 * s, y))
    paths.append(crest)
    # skull dome
    paths.append(circle_pts(cx, cy + s * 0.15, s * 0.55, n=48)[:30])
    # face opening T
    paths.append(
        [
            (cx - s * 0.18, cy + s * 0.35),
            (cx - s * 0.18, cy - s * 0.05),
            (cx - s * 0.42, cy - s * 0.05),
            (cx - s * 0.42, cy - s * 0.22),
            (cx + s * 0.42, cy - s * 0.22),
            (cx + s * 0.42, cy - s * 0.05),
            (cx + s * 0.18, cy - s * 0.05),
            (cx + s * 0.18, cy + s * 0.35),
        ]
    )
    # cheek guards
    paths.append(
        [
            (cx - s * 0.55, cy - s * 0.05),
            (cx - s * 0.62, cy - s * 0.55),
            (cx - s * 0.28, cy - s * 0.72),
            (cx - s * 0.22, cy - s * 0.35),
        ]
    )
    paths.append(
        [
            (cx + s * 0.55, cy - s * 0.05),
            (cx + s * 0.62, cy - s * 0.55),
            (cx + s * 0.28, cy - s * 0.72),
            (cx + s * 0.22, cy - s * 0.35),
        ]
    )
    return paths


def text_polylines(text: str, cx: float, cy: float, h: float = 0.72, tracking: float = 0.62) -> list[list[tuple[float, float]]]:
    """Very simple block-letter stick paths for V-carve (readable ACHILLES / VIII)."""
    glyphs: dict[str, list[list[tuple[float, float]]]] = {
        "A": [[(0, 0), (0.5, 1), (1, 0)], [(0.22, 0.38), (0.78, 0.38)]],
        "C": [[(0.95, 0.85), (0.55, 1), (0.15, 0.85), (0, 0.5), (0.15, 0.15), (0.55, 0), (0.95, 0.15)]],
        "E": [[(1, 1), (0, 1), (0, 0), (1, 0)], [(0, 0.5), (0.75, 0.5)]],
        "H": [[(0, 0), (0, 1)], [(1, 0), (1, 1)], [(0, 0.5), (1, 0.5)]],
        "I": [[(0.5, 0), (0.5, 1)], [(0.15, 1), (0.85, 1)], [(0.15, 0), (0.85, 0)]],
        "L": [[(0, 1), (0, 0), (1, 0)]],
        "S": [
            [
                (0.95, 0.82),
                (0.55, 1),
                (0.15, 0.85),
                (0.2, 0.62),
                (0.8, 0.42),
                (0.85, 0.18),
                (0.45, 0),
                (0.05, 0.15),
            ]
        ],
        "V": [[(0, 1), (0.5, 0), (1, 1)]],
        "X": [[(0, 1), (1, 0)], [(1, 1), (0, 0)]],
        " ": [],
        "VIII": [],  # handled as letters
    }
    # width units
    unit = h
    total = len(text) * tracking * unit
    x0 = cx - total / 2
    paths: list[list[tuple[float, float]]] = []
    for i, ch in enumerate(text):
        if ch not in glyphs:
            continue
        ox = x0 + i * tracking * unit
        oy = cy - h / 2
        for stroke in glyphs[ch]:
            paths.append([(ox + px * unit * 0.85, oy + py * h) for px, py in stroke])
    return paths


def braid_greek_paths() -> list[list[tuple[float, float]]]:
    """Double helix braid with Greek-key bands + eye nodes + lattice cells."""
    paths: list[list[tuple[float, float]]] = []
    xs = np.linspace(-DECK_L / 2 + 1.0, DECK_L / 2 - 1.0, 260)
    amp = 1.55
    # two sine bands
    for phase, sign in ((0.0, 1), (math.pi, -1)):
        upper: list[tuple[float, float]] = []
        lower: list[tuple[float, float]] = []
        for x in xs:
            y = sign * amp * math.sin(0.55 * x + phase)
            if not inside_deck(x, y):
                continue
            # band thickness ~0.55
            upper.append((float(x), float(y + 0.28)))
            lower.append((float(x), float(y - 0.28)))
        if len(upper) > 10:
            band = upper + list(reversed(lower))
            paths.append(band)
            # Greek-key ticks along centerline
            for i in range(0, len(upper) - 8, 8):
                x1, y1 = upper[i][0], (upper[i][1] + lower[i][1]) / 2
                x2 = upper[min(i + 3, len(upper) - 1)][0]
                paths.append([(x1, y1 - 0.12), (x1, y1 + 0.12), (x2, y1 + 0.12), (x2, y1 - 0.12)])
    # eyes at crossings
    for k in range(-5, 6):
        x = k * math.pi / 0.55
        if abs(x) > DECK_L / 2 - 1.5:
            continue
        paths.append(circle_pts(x, 0.0, 0.22, n=28))
        paths.append(
            [
                (x - 0.38, 0.0),
                (x, 0.18),
                (x + 0.38, 0.0),
                (x, -0.18),
            ]
        )
    # lattice in oval voids
    for k in range(-4, 5):
        cx = (k + 0.5) * math.pi / 0.55
        if abs(cx) > DECK_L / 2 - 2:
            continue
        for gx in np.linspace(cx - 0.7, cx + 0.7, 5):
            for gy in np.linspace(-0.55, 0.55, 4):
                if inside_deck(gx, gy) and abs(gy) < 0.7:
                    paths.append([(gx - 0.12, gy - 0.12), (gx + 0.12, gy - 0.12), (gx + 0.12, gy + 0.12), (gx - 0.12, gy + 0.12)])
    return paths


def honeycomb_paths(cell: float = 0.55) -> list[list[tuple[float, float]]]:
    paths: list[list[tuple[float, float]]] = []
    dx = cell * 1.5
    dy = cell * math.sqrt(3)
    y = -DECK_W / 2
    row = 0
    while y < DECK_W / 2:
        x = -DECK_L / 2 + (0 if row % 2 == 0 else dx / 2)
        while x < DECK_L / 2:
            hex_pts = []
            for i in range(6):
                a = math.pi / 6 + i * math.pi / 3
                hx = x + cell * 0.48 * math.cos(a)
                hy = y + cell * 0.48 * math.sin(a)
                hex_pts.append((hx, hy))
            if all(inside_deck(px, py) for px, py in hex_pts):
                # leave center logo clear
                if not (abs(x) < 2.2 and abs(y) < 2.2):
                    paths.append(hex_pts)
            x += dx
        y += dy / 2
        row += 1
    return paths


def write_svg(name: str, path_groups: list[tuple[str, list[list[tuple[float, float]]], float]]) -> Path:
    OUT_SVG.mkdir(parents=True, exist_ok=True)
    outline = deck_outline()
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{DECK_L}in" height="{DECK_W}in" viewBox="0 0 {DECK_L} {DECK_W}">',
        "  <!-- ACHILLES wavy CNC — units: inches — Utah Tech Stinger III / Fusion 360 -->",
        f'  <g id="deck-outline" fill="none" stroke="#222" stroke-width="0.04">',
        f'    <path d="{poly_to_svg_path(outline)}"/>',
        "  </g>",
    ]
    for gid, paths, sw in path_groups:
        parts.append(f'  <g id="{gid}" fill="none" stroke="#111" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">')
        for pts in paths:
            if len(pts) < 2:
                continue
            parts.append(f'    <path d="{poly_to_svg_path(pts, close=False)}"/>')
        parts.append("  </g>")
    parts.append("</svg>")
    out = OUT_SVG / name
    out.write_text("\n".join(parts), encoding="utf-8")
    return out


def write_dxf(name: str, all_paths: list[list[tuple[float, float]]]) -> Path:
    """Minimal ASCII DXF (R12) with LWPOLYLINE-like LINE segments as POLYLINE."""
    OUT_DXF.mkdir(parents=True, exist_ok=True)
    lines: list[str] = ["0", "SECTION", "2", "HEADER", "0", "ENDSEC", "0", "SECTION", "2", "TABLES", "0", "ENDSEC"]
    lines += ["0", "SECTION", "2", "ENTITIES"]
    # outline
    for pts in [deck_outline(), *all_paths]:
        if len(pts) < 2:
            continue
        lines += ["0", "POLYLINE", "8", "0", "66", "1", "70", "1" if pts is not all_paths and False else "0"]
        # open polyline
        lines = lines[:-1] + ["0"]  # fix: rebuild properly
    # cleaner rewrite
    lines = ["0", "SECTION", "2", "HEADER", "0", "ENDSEC", "0", "SECTION", "2", "ENTITIES"]
    def add_poly(pts: list[tuple[float, float]], closed: bool = False):
        nonlocal lines
        lines += ["0", "POLYLINE", "8", "CNC", "66", "1", "70", "1" if closed else "0"]
        for x, y in pts:
            # DXF: X along length, Y along width (same as board coords)
            lines += ["0", "VERTEX", "8", "CNC", "10", f"{x:.5f}", "20", f"{y:.5f}", "30", "0.0"]
        lines += ["0", "SEQEND"]

    add_poly(deck_outline(), closed=True)
    for pts in all_paths:
        if len(pts) >= 2:
            add_poly(pts, closed=False)
    lines += ["0", "ENDSEC", "0", "EOF"]
    out = OUT_DXF / name
    out.write_text("\n".join(lines), encoding="utf-8")
    return out


def heightmap_and_stl(name: str, mode: str = "topo", seed: int = 1) -> tuple[Path, Path]:
    """Generate 8-bit heightmap + binary-ish ASCII STL for Fusion 3D parallel finish."""
    OUT_HM.mkdir(parents=True, exist_ok=True)
    OUT_STL.mkdir(parents=True, exist_ok=True)
    # resolution: ~40 px / inch
    px_in = 36
    W = int(DECK_L * px_in)
    H = int(DECK_W * px_in)
    xs = np.linspace(-DECK_L / 2, DECK_L / 2, W)
    ys = np.linspace(-DECK_W / 2, DECK_W / 2, H)
    XX, YY = np.meshgrid(xs, ys)
    mask = np.zeros((H, W), dtype=bool)
    for j in range(H):
        for i in range(0, W, 4):  # sparse then dilate via vectorized approx
            pass
    # vectorized deck mask approximation
    hw, hl, tip_r = DECK_W / 2 - 0.15, DECK_L / 2 - 0.15, 2.0
    inside = np.abs(YY) <= hw
    body = np.abs(XX) <= (hl - tip_r)
    tip = np.abs(XX) > (hl - tip_r)
    local = np.abs(XX) - (hl - tip_r)
    y_max = np.sqrt(np.maximum(0.0, tip_r**2 - local**2)) * (hw / tip_r)
    inside = np.where(body, inside, tip & (np.abs(YY) <= y_max))

    rng = np.random.default_rng(seed)
    if mode == "topo":
        Z = (
            0.55 * np.sin(0.55 * XX + 0.4)
            + 0.25 * np.sin(1.6 * XX + 1.2 * YY)
            + 0.12 * np.sin(3.0 * XX)
            + 0.08 * np.sin(2.2 * YY + XX * 0.3)
        )
    elif mode == "sand":
        Z = 0.65 * np.sin(1.15 * XX + 0.35 * np.sin(0.4 * YY)) + 0.2 * np.sin(2.4 * XX)
    elif mode == "diamond":
        Z = 0.25 * np.sin(18 * (XX + YY)) * np.sin(18 * (XX - YY))
    else:
        Z = 0.5 * np.sin(0.55 * XX) * np.cos(0.35 * YY)

    # normalize to 0..1 carving depth field (1 = top of stock, 0 = deepest)
    Z = (Z - Z.min()) / (Z.max() - Z.min() + 1e-9)
    # logos sit higher (less carved) — leave flatter island in center
    rr = np.sqrt(XX**2 + (YY * 1.05) ** 2)
    logo = rr < 2.0
    Z = np.where(logo, 0.92 + 0.08 * Z, Z)
    Z = np.where(inside, Z, 0.0)

    img = (Z * 255).astype(np.uint8)
    hm = OUT_HM / f"{name}_heightmap.png"
    Image.fromarray(img, mode="L").save(hm)

    # ASCII STL — subsample for file size
    step = 3
    zs = Z * 0.14  # max relief depth ~0.14 in
    faces: list[str] = []
    for j in range(0, H - step, step):
        for i in range(0, W - step, step):
            if not (inside[j, i] or inside[j + step, i] or inside[j, i + step]):
                continue
            x0, y0 = float(xs[i]), float(ys[j])
            x1, y1 = float(xs[min(i + step, W - 1)]), float(ys[min(j + step, H - 1)])
            z00, z10 = float(zs[j, i]), float(zs[j, min(i + step, W - 1)])
            z01, z11 = float(zs[min(j + step, H - 1), i]), float(zs[min(j + step, H - 1), min(i + step, W - 1)])
            # two triangles
            for tri in (
                ((x0, y0, z00), (x1, y0, z10), (x1, y1, z11)),
                ((x0, y0, z00), (x1, y1, z11), (x0, y1, z01)),
            ):
                ax, ay, az = tri[1][0] - tri[0][0], tri[1][1] - tri[0][1], tri[1][2] - tri[0][2]
                bx, by, bz = tri[2][0] - tri[0][0], tri[2][1] - tri[0][1], tri[2][2] - tri[0][2]
                nx, ny, nz = ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx
                faces.append(
                    "  facet normal {0:.5f} {1:.5f} {2:.5f}\n"
                    "    outer loop\n"
                    "      vertex {3:.5f} {4:.5f} {5:.5f}\n"
                    "      vertex {6:.5f} {7:.5f} {8:.5f}\n"
                    "      vertex {9:.5f} {10:.5f} {11:.5f}\n"
                    "    endloop\n"
                    "  endfacet\n".format(
                        nx, ny, nz,
                        tri[0][0], tri[0][1], tri[0][2],
                        tri[1][0], tri[1][1], tri[1][2],
                        tri[2][0], tri[2][1], tri[2][2],
                    )
                )
    stl = OUT_STL / f"{name}_3Drelief.stl"
    with stl.open("w", encoding="utf-8") as f:
        f.write(f"solid {name}\n")
        f.write("".join(faces))
        f.write(f"endsolid {name}\n")
    return hm, stl


def render_preview(name: str, path_groups: list[tuple[str, list[list[tuple[float, float]]], float]], title: str) -> Path:
    """Flat technical preview showing wave density (not photoreal)."""
    OUT_PREV.mkdir(parents=True, exist_ok=True)
    scale = 40  # px per inch
    W, H = int(DECK_L * scale), int(DECK_W * scale)
    img = Image.new("RGB", (W, H), (232, 214, 186))
    draw = ImageDraw.Draw(img)

    def to_px(x: float, y: float) -> tuple[float, float]:
        return ((x + DECK_L / 2) * scale, (DECK_W / 2 - y) * scale)

    # wood grain tint
    for yy in range(0, H, 3):
        shade = 210 + (yy * 3) % 20
        draw.line([(0, yy), (W, yy)], fill=(shade, shade - 18, shade - 40), width=1)

    outline = [to_px(x, y) for x, y in deck_outline()]
    draw.polygon(outline, outline=(60, 45, 30), width=3)

    colors = {
        "waves": (90, 70, 45),
        "logo": (25, 20, 15),
        "text": (20, 15, 10),
        "grid": (100, 80, 55),
    }
    for gid, paths, sw in path_groups:
        col = colors.get(gid.split("-")[0], (40, 30, 20))
        width = max(1, int(sw * scale * 0.9))
        for pts in paths:
            if len(pts) < 2:
                continue
            draw.line([to_px(x, y) for x, y in pts], fill=col, width=width)

    img = img.filter(ImageFilter.SMOOTH_MORE)
    # banner
    banner = Image.new("RGB", (W, 48), (28, 24, 20))
    bdraw = ImageDraw.Draw(banner)
    bdraw.text((16, 14), title, fill=(230, 220, 200))
    out_img = Image.new("RGB", (W, H + 48), (28, 24, 20))
    out_img.paste(banner, (0, 0))
    out_img.paste(img, (0, 48))
    out = OUT_PREV / f"{name}_toolpath-preview.png"
    out_img.save(out, quality=95)
    return out


def build_all() -> None:
    designs = []

    # 1) Topographic waves + labyrinth + pinecone + ACHILLES
    avoid = [(-2.3, -2.5, 2.3, 1.2)]
    waves = wavy_topo_paths(spacing=0.16, amp=0.5, freq=0.52, seed=7, avoid_rects=avoid)
    logo = labyrinth_paths(0.0, 0.55, r=1.55)
    text = text_polylines("ACHILLES", 0.0, -1.55, h=0.7)
    groups = [("waves", waves, 0.035), ("logo", logo, 0.055), ("text", text, 0.07)]
    designs.append(("01_topo_labyrinth_ACHILLES", groups, "topo", "Topo waves · labyrinth · ACHILLES"))

    # 2) Diamond grid + lambda wreath + ACHILLES VIII
    grid = diamond_grid_paths(0.26)
    logo2 = laurel_wreath(0.0, 0.55, 1.4) + lambda_mark(0.0, 0.55, 1.05)
    text2 = text_polylines("ACHILLES", 0.0, -1.35, h=0.62) + text_polylines("VIII", 0.0, -2.15, h=0.5)
    groups2 = [("grid", grid, 0.028), ("logo", logo2, 0.055), ("text", text2, 0.065)]
    designs.append(("02_diamond_lambda_ACHILLES_VIII", groups2, "diamond", "Diamond grip · Λ wreath · ACHILLES VIII"))

    # 3) Sand dunes + Spartan + ACHILLES
    waves3 = wavy_topo_paths(spacing=0.15, amp=0.62, freq=1.05, seed=3, avoid_rects=[(-2.2, -2.4, 2.2, 1.3)])
    logo3 = greek_key_ring(0, 0.6, 1.45) + spartan_helmet(0, 0.6, 1.15) + laurel_wreath(0, 0.6, 1.55)
    text3 = text_polylines("ACHILLES", 0.0, -1.5, h=0.68)
    groups3 = [("waves", waves3, 0.034), ("logo", logo3, 0.05), ("text", text3, 0.07)]
    designs.append(("03_sand_spartan_ACHILLES", groups3, "sand", "Sand-dune waves · Spartan crest · ACHILLES"))

    # 4) Sand dunes + Eye of Horus + ACHILLES
    waves4 = wavy_topo_paths(spacing=0.15, amp=0.6, freq=1.0, seed=11, avoid_rects=[(-2.3, -2.5, 2.3, 1.4)])
    logo4 = eye_of_horus(0.0, 0.7, 1.55)
    text4 = text_polylines("ACHILLES", 0.0, -1.45, h=0.68)
    groups4 = [("waves", waves4, 0.034), ("logo", logo4, 0.055), ("text", text4, 0.07)]
    designs.append(("04_sand_eye_ACHILLES", groups4, "sand", "Sand-dune waves · Eye of Horus · ACHILLES"))

    # 5) Sand dunes + open laurel + ACHILLES
    waves5 = wavy_topo_paths(spacing=0.15, amp=0.58, freq=1.08, seed=19, avoid_rects=[(-2.2, -2.4, 2.2, 1.2)])
    logo5 = laurel_wreath(0.0, 0.65, 1.5)
    text5 = text_polylines("ACHILLES", 0.0, -1.4, h=0.68)
    groups5 = [("waves", waves5, 0.034), ("logo", logo5, 0.055), ("text", text5, 0.07)]
    designs.append(("05_sand_laurel_ACHILLES", groups5, "sand", "Sand-dune waves · laurel · ACHILLES"))

    # 6) Braid Greek-key
    braid = braid_greek_paths()
    groups6 = [("waves", braid, 0.04)]
    designs.append(("06_braid_greekkey_eyes", groups6, "topo", "Braided Greek-key waves · eye nodes · lattice"))

    # 7) Honeycomb + Spartan
    honey = honeycomb_paths(0.52)
    logo7 = greek_key_ring(0, 0.35, 1.5) + spartan_helmet(0, 0.35, 1.2)
    groups7 = [("grid", honey, 0.03), ("logo", logo7, 0.055)]
    designs.append(("07_honeycomb_spartan", groups7, "diamond", "Honeycomb field · Spartan helmet crest"))

    manifest = []
    for name, groups, hm_mode, title in designs:
        svg = write_svg(f"{name}.svg", groups)
        all_paths = [p for _, paths, _ in groups for p in paths]
        dxf = write_dxf(f"{name}.dxf", all_paths)
        hm, stl = heightmap_and_stl(name, mode=hm_mode, seed=hash(name) % 10_000)
        prev = render_preview(name, groups, title)
        manifest.append((name, svg, dxf, hm, stl, prev, title))
        print("built", name)

    OUT_SETUP.mkdir(parents=True, exist_ok=True)
    setup = OUT_SETUP / "WAVY_FUSION360_WINCNC_SETUP.txt"
    setup.write_text(
        f"""ACHILLES WAVY CNC — Utah Tech Atwood Makerspace
Machine: CAMaster Stinger III
CAD/CAM: Fusion 360 (what Utah Tech staff use)
Controller: WinCNC (post from Fusion)

Board size: {DECK_W}\" wide × {DECK_L}\" long (inches)
Carve side: UNDERSIDE (truck side) — grip tape covers the top

============================================================
FILES IN THIS PACK
============================================================
svg/*.svg     — Import into Fusion Design (Insert → SVG). Units = inches.
dxf/*.dxf     — Backup vectors for Fusion / VCarve.
stl/*_3Drelief.stl — True 3D wavy surface for Fusion Manufacture 3D → Parallel.
heightmaps/*_heightmap.png — Optional Mesh → Create Mesh from Heightmap.
previews/*_toolpath-preview.png — Line preview of what the vectors contain.

Designs:
01  Topographic waves + labyrinth / pinecone + ACHILLES
02  Diamond grip + Λ wreath + ACHILLES VIII
03  Sand-dune waves + Spartan crest + ACHILLES
04  Sand-dune waves + Eye of Horus + ACHILLES
05  Sand-dune waves + open laurel + ACHILLES
06  Braided Greek-key waves with eye nodes + lattice
07  Honeycomb field + Spartan helmet

============================================================
FUSION 360 → WINCNC (Stinger III) — EXACT FLOW
============================================================
1) Open Fusion 360 on a Makerspace PC (or your Mac).
2) New Design. Units: Inches.
3) Create → Box: {DECK_L}\" × {DECK_W}\" × 0.4\" (or your blank thickness).
4) Insert → SVG (or DXF): pick one design from svg/.
   - Scale: 1 SVG unit = 1 inch (check board is {DECK_L}\" long).
   - Position on the top face of the stock.
5) FOR THE WAVY 3D RELIEF (best look):
   a) Insert Mesh → the matching *_3Drelief.stl
   b) Align mesh to the deck face.
   c) Manufacture → 3D → Parallel (or Scallop)
      Tool: 1/8\" or 1/4\" ball nose
      Stepover: 8–12% of tool diameter
      Max depth / containment: deck outline
   d) Then 2D → Trace / Engrave OR V-Carve the logo+text SVG on top
      Tool: 60° V-bit (or 90° if that's what's loaded)
      Depth: 0.08\"–0.14\" into the already-waved surface
6) FOR FASTER 2.5D ONLY (no STL):
   - Manufacture → 2D Contour or Trace on all wave lines + logos
   - 60° V-bit, depth 0.10\"–0.16\"
   - Waves will read as carved grooves (still wavy, less “dune” 3D)

7) Post process:
   Manufacture → Actions → Post Process
   Post: WinCNC  (or “CAMaster ATC with WinCNC” if ATC)
   Output: .tap / .nc
8) Copy the posted file to the Stinger PC → open in WinCNC → run.

============================================================
STARTING SPEEDS (soft maple / birch blank — verify with staff)
============================================================
Ball nose 1/8\": 16–18k RPM, feed 40–70 ipm, stepdown 0.04\"
V-bit 60°:      16–18k RPM, feed 25–45 ipm, depth 0.10\"–0.14\"
Always scrap-test a corner first. Ask makerspace staff before first cut.
Contact: makerspace@utahtech.edu · 435-879-4532
""",
        encoding="utf-8",
    )

    readme = OUT_SETUP / "README.txt"
    readme.write_text(
        "ACHILLES wavy CNC pack for Utah Tech Stinger III.\n"
        "Primary software path: Fusion 360 → WinCNC.\n"
        "See WAVY_FUSION360_WINCNC_SETUP.txt for step-by-step.\n",
        encoding="utf-8",
    )

    # ZIP
    if PACK.exists():
        PACK.unlink()
    with zipfile.ZipFile(PACK, "w", zipfile.ZIP_DEFLATED) as z:
        for folder in (OUT_SVG, OUT_DXF, OUT_STL, OUT_HM, OUT_PREV, OUT_SETUP):
            for f in folder.rglob("*"):
                if f.is_file():
                    z.write(f, f.relative_to(ROOT).as_posix())
    print("ZIP", PACK, PACK.stat().st_size)


if __name__ == "__main__":
    build_all()
