# Achilles CNC / Laser — Ready-to-run files

Engrave these on the **underside** of the deck (truck side). Grip tape covers the top.

## Primary files (start here)

| File | Format | What it is |
|------|--------|------------|
| `svg/11-achilles-deck-underside-ENGRAVE.svg` | SVG | **Full deck** monogram — open this in your laser/CNC software |
| `dxf/achilles-deck-underside-ENGRAVE.dxf` | DXF | Same layout for software that prefers DXF |
| `svg/12-achilles-center-logo.svg` | SVG | Center wreath / Λ / Eye / ACHILLES / VIII only |
| `dxf/achilles-center-logo.dxf` | DXF | Center logo only |
| `svg/13-achilles-symbol-library.svg` | SVG | Individual icons to rearrange if you want |

**Size:** full deck file is **813 × 210 mm** (~32" × 8.25") — standard popsicle graphic area.

**Art style:** black **stroke-only** paths (no fills) so LightBurn / LaserGRBL / Carbide Create / VCarve / Fusion import as toolpaths.

**Icons included:** Eye of Horus, ankh, scarab, lotus, djed, uraeus, Bastet cat, falcon, Lambda A, pinecone, shen ring, winged disk, mini wreath, Roman numerals — matching your Achilles bottle-wrap sheet.

## LightBurn (laser)

1. File → Import → `11-achilles-deck-underside-ENGRAVE.svg`
2. Confirm units are **mm** (document should read ~813 × 210)
3. Select the gray dashed `#guides` group (deck outline / truck boxes) → Delete (or move to a non-output layer)
4. Select remaining black art → set layer to **Line / Engrave** (not Fill, not Cut-through)
5. Focus on maple bottom face
6. Starting point for maple diode/CO₂: low power test on scrap, then increase until you get a deep dark engraved line without cutting through the ply
7. Frame the job on the deck underside, then Run

## CNC router (deep cut look)

1. Import the **DXF** or SVG into Carbide Create, VCarve, Fusion, or similar
2. Assign toolpath to layer `ENGRAVE`
3. Suggested: 30°–60° V-bit or 1/16" ball nose
4. Depth for deep carved look: **0.8–2.0 mm** (test on scrap maple)
5. Climb mill, moderate feed — keep chips clear so edges stay sharp
6. Optional: delete `GUIDES` layer before posting G-code

## Tips

- Clamp the deck flat; engrave the **concave underside**
- Keep truck hole areas clear if you want clean hardware seats (guides show approximate truck boxes)
- Always scrap-test power/depth before the real deck
- Rebuild anytime: `python3 build_cnc_files.py`
