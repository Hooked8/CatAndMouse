# ACHILLES Skate Deck — Utah Tech Makerspace CNC Pack

## Machine to use

At **Utah Tech Atwood Innovation Plaza Makerspace** (St. George):

| Machine | Best for this job? | Why |
|---|---|---|
| **CAMaster Stinger III** | **Yes — use this** | Large CNC router; fits a full ~8.5" × 32" skate deck and dense V-carve |
| Inventables **X-Carve** | Only for a small test tile | Small router; full-deck all-over carve is not practical |

Confirmed on the makerspace equipment list: *X-Carve CNC Router* and *Camaster Stinger III CNC Router*.  
A makerspace intern workflow for the Stinger used **Fusion 360** toolpaths. CAMaster Stingers commonly run **WinCNC** on the controller.

**Contact:** makerspace@utahtech.edu · 435-879-4532  
**Training:** Free equipment training required before reserving.  
**Stinger rate:** $12.50 / 30 min (material not included).

## Software that works best

### Primary (recommended): Autodesk Fusion 360
1. Open Fusion 360 (makerspace computers often have Adobe + CAD tools; confirm Fusion is available during training).
2. **File → Open** or insert / import **`ACHILLES_Skate_Stinger_Fusion360.svg`** (or `.dxf`).
3. Units: **inches**.
4. Switch to **Manufacture**.
5. Create a **V-carve / Engrave** (or Trace + Engrave) operation:
   - Bit: **60° or 90° V-bit** (ask staff which is stocked)
   - Max depth: start around **0.08–0.15 in** for the pattern; crest can go slightly deeper
   - Select layers / sketches: `center-crest` + `all-over-pattern` (SVG groups)
6. Post process with **CAMaster WinCNC** / **WinCNC** post (Fusion post library: CAMaster / WinCNC).
7. Take the posted G-code / `.tap` to the **Stinger** PC running **WinCNC**.

### Also works: Vectric VCarve Pro / Aspire
Many Stinger shops use VCarve. Import the same **SVG** or **DXF**, assign a **V-Carve Toolpath**, post with the shop’s CAMaster post.

### Not ideal for full deck: Easel (X-Carve)
Use Easel only if you cut a **small sample plaque** of the crest on the X-Carve.

## Files in this folder

| File | Use |
|---|---|
| `ACHILLES_Skate_Stinger_Fusion360.svg` | **Main deliverable** — import to Fusion 360 or VCarve |
| `ACHILLES_Skate_Stinger_Fusion360.dxf` | Alternate CAD/CAM import |
| `README_UtahTech_CNC.md` | This guide |

## Design notes

- Deck size: **8.5 in × 32 in** (taller / US 11 fit)
- Center crest: wreath · A · Eye of Horus · pinecone · ACHILLES · VIII
- All-over icon pattern around the crest (ankhs, eyes, deltas, fleurs, monograms, Romans)
- Vectors are stroke paths suitable for **V-carve** (not color fills)

## Before you cut

1. Complete **Stinger CNC training**.
2. Confirm bit, feeds/speeds, and clamp/vacuum hold-down with staff.
3. Do a **scrap maple test** of a 4×4" crest tile before the full deck.
4. Hold-down: screws into spoilboard outside the final deck outline, or vacuum if available.
5. After carve: optional light stain wipe to darken recesses (like the bottle contrast), or leave raw maple.

## If staff ask what software you need

> “I have an SVG/DXF for the **CAMaster Stinger III**. I’ll toolpath it in **Fusion 360** with a **V-bit**, then post to **WinCNC**.”
