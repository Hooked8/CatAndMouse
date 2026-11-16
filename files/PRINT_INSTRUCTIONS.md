# Print Instructions — Classroom Engineering Demo

Configured build volume: **220 × 220 × 250 mm** (common classroom / Ender-3 class).  
Change `BED_X`, `BED_Y`, `BED_Z` in `src/config.py` if your printer differs, then re-run:

```bash
python3 src/export_all.py
```

Current pack uses about **201 × 165 mm** on the plate with **8 mm** edge margin — fits with room to spare. Max part height ≈ **28 mm**.

## What is on the plate

| File | Lesson | Print notes |
|------|--------|-------------|
| `cutaway_body.stl` | Cutaway display | Cut face down — **no supports** |
| `cutaway_cradle.stl` | Cutaway display | Flat on base — **no supports** |
| `baffle_demo_token.stl` | Cutaway display | Flat disk — **no supports** |
| `mold_half_a_pins.stl` | Geometric mold | Parting face up — **no supports** |
| `mold_half_b_sprue.stl` | Geometric mold | Parting face up — **no supports** |
| `mold_master_frustum.stl` | Geometric mold | Flange down — **no supports** |

Combined plate file: `3mf/classroom_demo_build_plate.3mf` (all parts pre-positioned).  
Preview mesh: `stl/classroom_demo_build_plate.stl`.

## Recommended slicer settings

- **Material:** PLA or PETG
- **Layer height:** 0.20 mm (0.28 mm OK for classroom speed)
- **Infill:** 15–20%
- **Walls:** 3
- **Supports:** Off (parts are oriented to avoid them)
- **Bed adhesion:** brim optional on the cutaway body if corners lift
- **Per-object colors (optional):** orange/terracotta for cutaway parts, blue/slate for mold parts

## Part 1 — Non-functional cutaway display

1. Print `cutaway_body`, `cutaway_cradle`, and `baffle_demo_token`.
2. Place the body in the cradle with the open cutaway facing the class.
3. Point out the oversized schematic bore, dummy sealed ends, and baffle disks.
4. Pass around the loose baffle token.
5. Read the embossed markings aloud: **EDUCATION ONLY / NON-FUNCTIONAL / CLASSROOM DEMO**.

This model is a schematic teaching cutaway only. It is not threaded, not attachable, and not a functional firearm accessory.

## Part 2 — Two-part geometric mold (truncated cone)

1. Print both mold halves and the master frustum.
2. Align mold A pins into mold B holes at the parting plane.
3. Optional classroom cast: pour low-temp wax, soap, or chocolate through the sprue (follow school safety rules).
4. Open the mold and compare the cast to `mold_master_frustum`.
5. Discuss draft angle, parting line, flash gap, and alignment pins.

The mold cavity is a **basic truncated cone** only. It is intentionally not suppressor geometry.

## Regeneration

```bash
pip install -r requirements.txt
python3 src/export_all.py
```

Editable sources live in `src/`. Fit data is written to `exports/fit_report.json` and `exports/plate_layout.json`.
