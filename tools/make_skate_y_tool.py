#!/usr/bin/env python3
"""
ACHILLES skate Y-tool — 3D-printable tri-socket wrench
======================================================
Three standard skateboard hex sizes (across-flats):
  - 3/8"  (9.53 mm)  — truck mounting hardware
  - 1/2"  (12.7 mm)  — axle / wheel nuts
  - 9/16" (14.29 mm) — kingpin nut

Center pocket sized for a press-fit 5/16"-24 UNF rethreader die
(optional metal insert; tool works without it).

Print flat on the bed, PETG or ABS preferred for strength.
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
import trimesh
from shapely.geometry import Point, Polygon, box
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "shopify"

# --- Nominal skate sizes (inches → mm) ---
SIZES = [
    {"label": "3/8", "af_in": 3 / 8, "use": "mounting hardware"},
    {"label": "1/2", "af_in": 1 / 2, "use": "axle / wheel nuts"},
    {"label": "9/16", "af_in": 9 / 16, "use": "kingpin nut"},
]

# FDM clearance so sockets slide onto real nuts (PETG/ABS ~0.3–0.4)
CLEARANCE_MM = 0.35
# Extra taper at mouth (helps start on the nut)
CHAMFER_MM = 0.40

THICK = 15.0
ARM_LEN = 42.0          # center → socket face
ARM_WIDTH = 20.0
HUB_R = 17.0
SOCKET_DEPTH = 12.0
WALL = 5.5              # radial wall outside hex vertices
GRIP_GROOVES = 3
GRIP_DEPTH = 0.7
GRIP_WIDTH = 1.1
GRIP_START = 12.0       # mm from socket face back toward hub

# 5/16-24 die pocket (common small hex die ~18–20 mm OD; use round pocket)
DIE_POCKET_D = 18.6
DIE_POCKET_DEPTH = 5.5
DIE_THRU_D = 9.0        # clearance for axle through the die

ENGRAVE = 0.55


def inch(x: float) -> float:
    return x * 25.4


def hex_polygon(af: float, center=(0.0, 0.0)) -> Polygon:
    """Regular hexagon, distance across flats = af, flat-topped."""
    r = af / math.sqrt(3)  # center → vertex for flat-to-flat = af
    # flat-topped: first vertex at 30°
    pts = []
    for i in range(6):
        ang = math.radians(30 + 60 * i)
        pts.append((center[0] + r * math.cos(ang), center[1] + r * math.sin(ang)))
    return Polygon(pts)


def arm_outline(angle_deg: float, tip_r: float) -> Polygon:
    """Rectangular arm ending in a flat circular tip (socket face)."""
    ang = math.radians(angle_deg)
    ux, uy = math.cos(ang), math.sin(ang)
    px, py = -uy, ux  # perpendicular

    inner = HUB_R - 2.0
    # Tip face sits at ARM_LEN; disc centered slightly inward so the
    # outer flat of the disc is the printable socket face.
    tip_center = ARM_LEN - tip_r
    outer = tip_center
    half_w = ARM_WIDTH / 2

    c0 = (ux * inner, uy * inner)
    c1 = (ux * (outer + tip_r * 0.15), uy * (outer + tip_r * 0.15))
    corners = [
        (c0[0] + px * half_w, c0[1] + py * half_w),
        (c0[0] - px * half_w, c0[1] - py * half_w),
        (c1[0] - px * half_w, c1[1] - py * half_w),
        (c1[0] + px * half_w, c1[1] + py * half_w),
    ]
    arm = Polygon(corners).buffer(1.0, join_style=1)
    tip = Point(ux * tip_center, uy * tip_center).buffer(tip_r)
    return unary_union([arm, tip])


def y_body_2d() -> Polygon:
    hub = Point(0, 0).buffer(HUB_R)
    arms = []
    for i, spec in enumerate(SIZES):
        af = inch(spec["af_in"]) + CLEARANCE_MM
        tip_r = af / math.sqrt(3) + WALL
        ang = 90 + i * 120  # 90°, 210°, 330° — one arm "up"
        # Put largest (9/16) on one arm, etc. Order: 3/8 at bottom-ish in ref;
        # angles: i=0 → 90° (up), i=1 → 210°, i=2 → 330°
        arms.append(arm_outline(ang, tip_r))
    return unary_union([hub] + arms)


def extrude(poly: Polygon, z0: float, z1: float) -> trimesh.Trimesh:
    return trimesh.creation.extrude_polygon(poly, height=z1 - z0, engine="triangle")


def hex_socket_cutter(af: float, depth: float, mouth_extra: float = CHAMFER_MM) -> trimesh.Trimesh:
    """Hex prism with a slightly larger mouth for easier nut entry."""
    deep = extrude(hex_polygon(af), 0, depth + 0.2)
    if mouth_extra <= 0:
        return deep
    mouth = extrude(hex_polygon(af + 2 * mouth_extra), 0, 1.8)
    mouth.apply_translation([0, 0, depth - 1.5])
    try:
        return deep.union(mouth, engine="manifold")
    except Exception:
        return trimesh.util.concatenate([deep, mouth])


def cylinder(r: float, h: float, sections: int = 48) -> trimesh.Trimesh:
    return trimesh.creation.cylinder(radius=r, height=h, sections=sections)


def transform_to_arm(mesh: trimesh.Trimesh, angle_deg: float, along: float) -> trimesh.Trimesh:
    """Place mesh at arm tip; local +Z is socket depth into tool from the tip face."""
    m = mesh.copy()
    # Tip face is at distance `along` from origin; socket bores inward toward hub (-radial)
    ang = math.radians(angle_deg)
    # Rotate so local +Z aligns with -radial (into the arm from the tip)
    # Default cylinder/extrude is along +Z. We want axis along -radial direction in XY,
    # and the opening facing outward.
    # 1) rotate -90° about Y so +Z → +X
    Ry = trimesh.transformations.rotation_matrix(-math.pi / 2, [0, 1, 0])
    m.apply_transform(Ry)
    # 2) rotate about Z to arm angle (so +X → arm direction); opening faces outward
    Rz = trimesh.transformations.rotation_matrix(ang, [0, 0, 1])
    m.apply_transform(Rz)
    # 3) move to tip; opening starts at tip and cuts inward
    # After Ry+Rz, local +Z of original is along arm outward. Extrusion +Z goes outward from z=0.
    # Place z=0 plane at tip: translate along arm by `along`.
    m.apply_translation([along * math.cos(ang), along * math.sin(ang), THICK / 2])
    # Center vertically: sockets are extruded in local space from 0; after Ry the hex
    # lies in a plane through origin. Shift so hex is centered in tool thickness.
    # Current center z should be THICK/2 already from translation; hex prism was along Z
    # then mapped to radial, so thickness direction is world Z — good, but hex is a
    # 2D extrude in XY of local then remapped. Check bounds after and re-center Z.
    cz = (m.bounds[0][2] + m.bounds[1][2]) / 2
    m.apply_translation([0, 0, THICK / 2 - cz])
    return m


def grip_rings(angle_deg: float, tip_r: float) -> list[trimesh.Trimesh]:
    """Toroidal-ish groove rings around the arm near the socket."""
    ang = math.radians(angle_deg)
    ux, uy = math.cos(ang), math.sin(ang)
    cuts = []
    for i in range(GRIP_GROOVES):
        dist = ARM_LEN - GRIP_START - i * (GRIP_WIDTH + 1.4)
        # Thin box cutting across arm width
        ring = box(
            -ARM_WIDTH,
            -GRIP_WIDTH / 2,
            ARM_WIDTH,
            GRIP_WIDTH / 2,
        ).buffer(0)
        # Actually use a long thin rectangle perpendicular to arm, on top+bottom faces
        rect = Polygon(
            [
                (-ARM_WIDTH, -GRIP_WIDTH / 2),
                (ARM_WIDTH, -GRIP_WIDTH / 2),
                (ARM_WIDTH, GRIP_WIDTH / 2),
                (-ARM_WIDTH, GRIP_WIDTH / 2),
            ]
        )
        top = extrude(rect, THICK - GRIP_DEPTH, THICK + 0.2)
        bot = extrude(rect, -0.2, GRIP_DEPTH)
        for part in (top, bot):
            # local X is across arm; rotate so local Y aligns with arm
            Rz = trimesh.transformations.rotation_matrix(ang - math.pi / 2, [0, 0, 1])
            part.apply_transform(Rz)
            part.apply_translation([ux * dist, uy * dist, 0])
            cuts.append(part)
    return cuts


def engrave_rect_label(text_w: float, text_h: float) -> trimesh.Trimesh:
    return extrude(box(-text_w / 2, -text_h / 2, text_w / 2, text_h / 2), 0, ENGRAVE + 0.2)


def build() -> trimesh.Trimesh:
    body2d = y_body_2d()
    body = extrude(body2d, 0, THICK)
    body = body.process(validate=True)

    cutters: list[trimesh.Trimesh] = []

    angles = [90 + i * 120 for i in range(3)]
    # Assign sizes: bottom arm (270° equivalent) = 3/8 like the photo.
    # angles: 90 (up), 210 (lower-left), 330 (lower-right)
    # Remap so 3/8 is at 210° (lower-left in photo was bottom — use 270 by rotating set)
    # Use 90=9/16 (largest up), 210=1/2, 330=3/8 — or match photo: bottom=3/8
    order = [1, 0, 2]  # will reassign below
    # Explicit mapping angle → size index
    mapping = {
        90: 2,   # up: 9/16 kingpin
        210: 1,  # lower-left: 1/2 axle
        330: 0,  # lower-right: 3/8 mounting
    }

    for ang in angles:
        spec = SIZES[mapping[ang]]
        af = inch(spec["af_in"]) + CLEARANCE_MM
        tip_r = af / math.sqrt(3) + WALL
        cutter = hex_socket_cutter(af, SOCKET_DEPTH)
        # Bore from slightly outside the tip so the mouth is open
        # Open at the flat tip face (outer edge of tip disc = ARM_LEN)
        cutters.append(transform_to_arm(cutter, ang, ARM_LEN - 0.05))
        cutters.extend(grip_rings(ang, tip_r))

        # Size label pocket on top face of arm
        label = engrave_rect_label(10.5 if spec["label"] != "9/16" else 12.5, 3.2)
        mid = (HUB_R + ARM_LEN - tip_r) * 0.55
        Rz = trimesh.transformations.rotation_matrix(math.radians(ang) - math.pi / 2, [0, 0, 1])
        label.apply_transform(Rz)
        label.apply_translation(
            [mid * math.cos(math.radians(ang)), mid * math.sin(math.radians(ang)), THICK - ENGRAVE]
        )
        cutters.append(label)

    # Center die pocket from top + thru hole
    die = cylinder(DIE_POCKET_D / 2, DIE_POCKET_DEPTH + 0.4, 64)
    die.apply_translation([0, 0, THICK - DIE_POCKET_DEPTH / 2 + 0.1])
    cutters.append(die)
    thru = cylinder(DIE_THRU_D / 2, THICK + 2, 48)
    thru.apply_translation([0, 0, THICK / 2])
    cutters.append(thru)

    # ACHILLES brand engrave on bottom face (mirror for print orientation)
    brand = engrave_rect_label(22, 4.0)
    brand.apply_translation([0, -HUB_R * 0.15, 0])
    # cut from bottom
    brand.vertices[:, 2] = ENGRAVE - brand.vertices[:, 2]  # flip into bottom
    cutters.append(brand)

    # Boolean difference
    result = body
    for i, c in enumerate(cutters):
        c = c.process(validate=True)
        try:
            result = result.difference(c, engine="manifold")
        except Exception:
            try:
                result = trimesh.boolean.difference([result, c], engine="blender")
            except Exception as e:
                print(f"warn: skip cutter {i}: {e}")
                continue
        if result is None or result.is_empty:
            raise RuntimeError(f"boolean failed at cutter {i}")

    result = result.process(validate=True)
    # Sit on bed
    result.apply_translation(-result.bounds[0])
    return result


def write_preview(mesh: trimesh.Trimesh, path: Path) -> None:
    # Top-view silhouette preview
    from PIL import Image, ImageDraw, ImageFont

    bounds = mesh.bounds
    w = bounds[1][0] - bounds[0][0]
    h = bounds[1][1] - bounds[0][1]
    scale = 6.0
    img_w, img_h = int(w * scale) + 40, int(h * scale) + 80
    im = Image.new("RGB", (img_w, img_h), (236, 236, 236))
    d = ImageDraw.Draw(im)

    # Project faces roughly by sampling section near mid thickness
    # Use outline from 2D path instead
    body2d = y_body_2d()
    minx, miny, maxx, maxy = body2d.bounds
    ox, oy = 20 - minx * scale, 50 - miny * scale

    def draw_poly(poly, fill, outline=None):
        if poly.is_empty:
            return
        if poly.geom_type == "MultiPolygon":
            for g in poly.geoms:
                draw_poly(g, fill, outline)
            return
        pts = [(ox + x * scale, oy + (maxy + miny - y) * scale) for x, y in poly.exterior.coords]
        d.polygon(pts, fill=fill, outline=outline)
        for ring in poly.interiors:
            hpts = [(ox + x * scale, oy + (maxy + miny - y) * scale) for x, y in ring.coords]
            d.polygon(hpts, fill=(236, 236, 236), outline=outline)

    draw_poly(body2d, (88, 72, 168), (40, 40, 40))

    # Hex openings
    angles = [90, 210, 330]
    mapping = {90: 2, 210: 1, 330: 0}
    for ang in angles:
        spec = SIZES[mapping[ang]]
        af = inch(spec["af_in"]) + CLEARANCE_MM
        cx = ARM_LEN * math.cos(math.radians(ang))
        cy = ARM_LEN * math.sin(math.radians(ang))
        hx = hex_polygon(af, (cx, cy))
        draw_poly(hx, (20, 20, 20))
        # label
        lx = ox + (ARM_LEN * 0.52 * math.cos(math.radians(ang))) * scale
        ly = oy + (maxy + miny - ARM_LEN * 0.52 * math.sin(math.radians(ang))) * scale
        d.text((lx - 14, ly - 6), spec["label"], fill=(250, 250, 250))

    # center die
    die = Point(0, 0).buffer(DIE_POCKET_D / 2)
    draw_poly(die, (50, 50, 50))
    thru = Point(0, 0).buffer(DIE_THRU_D / 2)
    draw_poly(thru, (236, 236, 236))

    d.rectangle([0, 0, img_w, 28], fill=(25, 25, 25))
    d.text(
        (10, 7),
        "ACHILLES skate Y-tool  3/8 · 1/2 · 9/16  (+0.30mm clearance)",
        fill=(240, 240, 240),
    )
    # legend
    y0 = img_h - 48
    d.text((12, y0), "3/8\" mounting   1/2\" axle nuts   9/16\" kingpin", fill=(30, 30, 30))
    d.text((12, y0 + 16), "Center pocket: optional 5/16-24 UNF die  |  PETG/ABS, 100% infill arms", fill=(30, 30, 30))
    im.save(path)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    print("Building ACHILLES skate Y-tool…")
    mesh = build()
    assert mesh.is_volume, "mesh is not a volume"
    print(f"volume ok  bounds={mesh.bounds.tolist()}  tris={len(mesh.faces)}")

    stl = OUT / "achilles-skate-y-tool.stl"
    mesh.export(stl)
    preview = OUT / "achilles-skate-y-tool-preview.png"
    write_preview(mesh, preview)

    # Also export a tight size card
    readme = OUT / "SKATE-Y-TOOL-README.txt"
    lines = [
        "ACHILLES skate Y-tool (3D printable)",
        "====================================",
        "",
        "Sockets (across-flats) with +0.30 mm FDM clearance:",
    ]
    for s in SIZES:
        af = inch(s["af_in"])
        lines.append(
            f"  - {s['label']:>4}\"  nominal {af:.3f} mm  printed {af+CLEARANCE_MM:.3f} mm  — {s['use']}"
        )
    lines += [
        "",
        "Center: 18.6 mm pocket × 5.5 mm deep for optional 5/16\"-24 UNF rethreader die,",
        "plus 9 mm through-hole for the axle.",
        "",
        "Print: flat on bed, ≥4 perimeters, ≥40% infill (100% near sockets), PETG or ABS.",
        "File: achilles-skate-y-tool.stl",
        f"Size: {mesh.extents[0]:.1f} × {mesh.extents[1]:.1f} × {mesh.extents[2]:.1f} mm",
    ]
    readme.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("Wrote", stl, preview, readme)


if __name__ == "__main__":
    main()
