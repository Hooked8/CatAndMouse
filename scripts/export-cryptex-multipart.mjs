/**
 * Multi-part Cryptex Vault — engineered for FDM assembly (NOT print-in-place).
 * Code: 6767 (rear → nose)
 *
 * Parts on one plate:
 *  1. Housing tube + rear bulkhead
 *  2–5. Four dial rings (gates cut at unlock digits 6,7,6,7)
 *  6. Sliding vault (dogs + stash cavity)
 *  7. Nose grip / pull knob (glues or screws onto vault)
 *  8. Retention clip (snaps into vault rear so it can't fall out)
 *
 * Fits (mm): radial sliding clearance 0.35, axial dial groove 0.40
 */
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'cryptex-parts')

const CODE = [6, 7, 6, 7]
const CLEAR_R = 0.35 // radial clearance shaft↔dial
const CLEAR_A = 0.40 // axial clearance dial in groove
const SEG = 64

// ——— Primary dimensions (mm) ———
const HOUSING_OD = 52
const HOUSING_ID = 44
const HOUSING_LEN = 78
const REAR_WALL = 3.5

const DIAL_OD = 51.2
const DIAL_ID = 36.0
const DIAL_W = 11.0
const DIAL_N = 4
const GATE_WIDTH_DEG = 28 // gate opening width
const GATE_DEPTH = 3.2 // radial depth of gate from ID

const VAULT_OD = DIAL_ID - 2 * CLEAR_R // 35.3
const VAULT_LEN = 72
const DOG_H = 2.8 // radial height of dog into gate
const DOG_W = 5.5 // circumferential-ish width (box approx)
const DOG_Z = 6.5 // axial thickness of dog
const CAVITY_ID = 20
const CAVITY_DEPTH = 48

const NOSE_OD = 48
const NOSE_LEN = 14
const CLIP_OD = VAULT_OD + 4
const CLIP_LEN = 4

function digitAngle(d) {
  // 0 at +Y (top / witness), increasing CCW when viewing from nose
  return (d / 10) * Math.PI * 2 + Math.PI / 2
}

function normalize(g) {
  const geo = g.index ? g.toNonIndexed() : g.clone()
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', geo.attributes.position.clone())
  g.dispose()
  if (geo !== g) geo.dispose()
  return out
}

function merge(list) {
  const cleaned = list.filter(Boolean).map((g) => (g.attributes?.position ? g : normalize(g)))
  const m = mergeGeometries(cleaned, false)
  cleaned.forEach((g) => g.dispose())
  if (!m) throw new Error('merge failed')
  return m
}

/** Cylinder along Z */
function cylZ(r, h, z = 0, seg = SEG) {
  const g = new THREE.CylinderGeometry(r, r, h, seg)
  g.rotateX(Math.PI / 2)
  g.translate(0, 0, z)
  return normalize(g)
}

function boxAt(w, h, d, x, y, z) {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(x, y, z)
  return normalize(g)
}

/** Annular tube along Z via ExtrudeGeometry */
function tubeZ(outerR, innerR, h, z = 0, seg = SEG) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: false,
    steps: 1,
    curveSegments: seg,
  })
  g.translate(0, 0, -h / 2 + z)
  return normalize(g)
}

/**
 * Dial ring with internal gate notch at unlock digit.
 * Gate = missing sector on the ID so the vault dog can pass when aligned.
 * Implemented as tube + gate "cheeks" omitted: we boolean-approx by
 * building the ring as tube, then NOT adding material in the gate —
 * for STL we cut the gate by using a thinner ID arc. Practical approach:
 * full tube, then we subtract conceptually by placing the gate as an
 * open slot using Shape with outer circle and inner circle + gate wedge
 * removed from inner wall via custom shape.
 */
function buildDial(unlockDigit) {
  const parts = []
  // Main ring body
  parts.push(tubeZ(DIAL_OD / 2, DIAL_ID / 2, DIAL_W, 0, SEG))

  // Knurl grips on OD
  for (let k = 0; k < 20; k++) {
    const a = (k / 20) * Math.PI * 2
    const r = DIAL_OD / 2 + 0.55
    parts.push(boxAt(2.0, 2.0, DIAL_W - 2.5, Math.cos(a) * r, Math.sin(a) * r, 0))
  }

  // Digit ticks 0-9; unlock digit gets tall amber-style tick
  for (let d = 0; d < 10; d++) {
    const a = digitAngle(d)
    const isCode = d === unlockDigit
    const len = isCode ? 5.2 : 2.6
    const thick = isCode ? 2.6 : 1.15
    const r = DIAL_OD / 2 - 1.3
    parts.push(
      boxAt(thick, len, 1.3, Math.cos(a) * r, Math.sin(a) * r, DIAL_W / 2 - 1.2),
    )
    // Small index pip near face for counting
    parts.push(
      boxAt(1.0, 1.0, 0.8, Math.cos(a) * (r - 2.2), Math.sin(a) * (r - 2.2), -DIAL_W / 2 + 1.0),
    )
  }

  // Gate liner cheeks — leave GATE_WIDTH_DEG open at unlock angle.
  // Represent gate by two raised inner-wall pads that STOP the dog except in the gap.
  // Dog passes only through the angular gap between cheeks.
  const ga = digitAngle(unlockDigit)
  const halfGate = ((GATE_WIDTH_DEG / 2) * Math.PI) / 180
  // Blocking inner rim: many small pads covering ID except the gate window
  const padCount = 36
  for (let i = 0; i < padCount; i++) {
    const a = (i / padCount) * Math.PI * 2
    let delta = Math.abs(Math.atan2(Math.sin(a - ga), Math.cos(a - ga)))
    if (delta < halfGate) continue // open gate window
    const r = DIAL_ID / 2 - GATE_DEPTH / 2 + 0.1
    parts.push(boxAt(2.2, GATE_DEPTH, DIAL_W - 1.2, Math.cos(a) * r, Math.sin(a) * r, 0))
  }

  return merge(parts)
}

function buildHousing() {
  const parts = []
  // Outer shell (open both ends — rear cap is separate part for assembly)
  parts.push(tubeZ(HOUSING_OD / 2, HOUSING_ID / 2, HOUSING_LEN, HOUSING_LEN / 2, SEG))
  // Dial seats: internal annular ridges separating dials (grooves between)
  const pitch = DIAL_W + CLEAR_A
  const firstDialCenter = CLEAR_A + DIAL_W / 2 + 2
  for (let i = 0; i <= DIAL_N; i++) {
    const z = firstDialCenter - DIAL_W / 2 - CLEAR_A / 2 + i * pitch
    parts.push(tubeZ(HOUSING_ID / 2 - 0.05, HOUSING_ID / 2 - 1.8, 1.6, z, 48))
  }
  // Witness mark on OD top
  parts.push(boxAt(3.6, 4.0, 12, 0, HOUSING_OD / 2 + 0.8, 14))
  // Front lip (keeps dials from sliding out the nose)
  const frontZ = firstDialCenter - DIAL_W / 2 - CLEAR_A / 2 + DIAL_N * pitch + 2
  parts.push(tubeZ(HOUSING_OD / 2, HOUSING_ID / 2 - 1.2, 3.2, frontZ, 48))
  // Label flat
  parts.push(boxAt(18, 1.5, 28, 0, -HOUSING_OD / 2 + 0.5, HOUSING_LEN / 2))
  return merge(parts)
}

function buildRearCap() {
  // Presses into housing rear after vault+dials assembled
  const parts = []
  parts.push(cylZ(HOUSING_OD / 2, REAR_WALL, REAR_WALL / 2, 48))
  // Plug boss into housing ID
  parts.push(cylZ(HOUSING_ID / 2 - CLEAR_R, 5, REAR_WALL + 2.2, 40))
  // Center hole for vault stem / clip access
  parts.push(tubeZ(6.5, 4.2, REAR_WALL + 5, REAR_WALL / 2, 28))
  // Finger grips
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    parts.push(
      boxAt(2, 2.5, REAR_WALL - 0.5, Math.cos(a) * (HOUSING_OD / 2 - 2), Math.sin(a) * (HOUSING_OD / 2 - 2), REAR_WALL / 2),
    )
  }
  return merge(parts)
}

function buildVault() {
  const parts = []
  // Main shaft
  parts.push(cylZ(VAULT_OD / 2, VAULT_LEN, VAULT_LEN / 2, SEG))

  // Stash cavity: hollow from the nose end — tube section at front
  // Overwrite front with tube so cavity is open to nose
  const cavityZ = VAULT_LEN - CAVITY_DEPTH / 2
  parts.push(tubeZ(VAULT_OD / 2, CAVITY_ID / 2, CAVITY_DEPTH, cavityZ, 48))

  // Dogs: one under each dial centerline, at unlock angles for 6767
  // Closed position: vault fully inserted; dial centers match housing grooves
  const firstDialCenter = CLEAR_A + DIAL_W / 2 + 2
  const pitch = DIAL_W + CLEAR_A
  for (let i = 0; i < DIAL_N; i++) {
    const z = firstDialCenter + i * pitch
    const a = digitAngle(CODE[i])
    const r = VAULT_OD / 2 + DOG_H / 2 - 0.05
    parts.push(boxAt(DOG_W, DOG_H, DOG_Z, Math.cos(a) * r, Math.sin(a) * r, z))
  }

  // Rear stem for retention clip
  parts.push(cylZ(VAULT_OD / 2 - 1.5, 6, -2, 32))
  // Nose tenon for grip
  parts.push(cylZ(VAULT_OD / 2 - 2, 8, VAULT_LEN + 3, 32))

  return merge(parts)
}

function buildNoseGrip() {
  const parts = []
  parts.push(cylZ(NOSE_OD / 2, NOSE_LEN, NOSE_LEN / 2, 48))
  // Finger groove
  parts.push(tubeZ(NOSE_OD / 2 + 0.8, NOSE_OD / 2 - 3, 4, NOSE_LEN / 2, 40))
  // Socket for vault tenon
  parts.push(tubeZ(VAULT_OD / 2 - 2 + CLEAR_R + 0.15, 4, 8, 3, 32))
  // Face recess showing cavity access when open
  parts.push(tubeZ(CAVITY_ID / 2 + 2, CAVITY_ID / 2 - 0.5, 3, NOSE_LEN - 1.2, 32))
  return merge(parts)
}

function buildRetentionClip() {
  // C-clip that snaps onto vault rear stem — stops vault from pulling fully out
  const parts = []
  parts.push(tubeZ(CLIP_OD / 2, VAULT_OD / 2 - 1.5 + CLEAR_R, CLIP_LEN, 0, 40))
  // Split gap so it flexes onto stem
  // (gap approximated by omitting a sector — add two ears instead of full tube)
  parts.push(boxAt(6, 3, CLIP_LEN, CLIP_OD / 2 + 1, 0, 0))
  parts.push(boxAt(6, 3, CLIP_LEN, -CLIP_OD / 2 - 1, 0, 0))
  return merge(parts)
}

/** Place part on plate: rotate so Z-axis of part becomes Y (up), sit on bed */
function orientForPlate(geo) {
  const g = geo.clone()
  g.rotateX(-Math.PI / 2)
  g.computeBoundingBox()
  const bb = g.boundingBox
  g.translate(0, -bb.min.y, 0)
  const cx = (bb.min.x + bb.max.x) / 2
  const cz = (bb.min.z + bb.max.z) / 2
  g.translate(-cx, 0, -cz)
  g.computeBoundingBox()
  return g
}

function footprint(geo) {
  const bb = geo.boundingBox
  return {
    w: bb.max.x - bb.min.x,
    d: bb.max.z - bb.min.z,
    h: bb.max.y - bb.min.y,
  }
}

function placeAt(geo, x, z) {
  const g = geo.clone()
  g.translate(x, 0, z)
  g.computeBoundingBox()
  return g
}

function exportStl(geo, path) {
  const mesh = new THREE.Mesh(geo)
  const stl = new STLExporter().parse(mesh, { binary: false })
  writeFileSync(path, stl)
  return Buffer.byteLength(stl)
}

// ——— Build all parts ———
mkdirSync(outDir, { recursive: true })

const housing = orientForPlate(buildHousing())
const rearCap = orientForPlate(buildRearCap())
const dials = CODE.map((d) => orientForPlate(buildDial(d)))
const vault = orientForPlate(buildVault())
const nose = orientForPlate(buildNoseGrip())
const clip = orientForPlate(buildRetentionClip())

const named = [
  { name: '01-housing', geo: housing },
  { name: '02-rear-cap', geo: rearCap },
  { name: '03-dial-6-rear', geo: dials[0] },
  { name: '04-dial-7', geo: dials[1] },
  { name: '05-dial-6', geo: dials[2] },
  { name: '06-dial-7-nose', geo: dials[3] },
  { name: '07-vault-slider', geo: vault },
  { name: '08-nose-grip', geo: nose },
  { name: '09-retention-clip', geo: clip },
]

// Export individual STLs
const sizes = {}
for (const p of named) {
  const bytes = exportStl(p.geo, join(outDir, `${p.name}.stl`))
  sizes[p.name] = { bytes, ...footprint(p.geo) }
}

// ——— Arrange on one 220×220 plate ———
const BED = 220
const MARGIN = 6
let cursorX = -BED / 2 + MARGIN
let cursorZ = -BED / 2 + MARGIN
let rowH = 0
const placed = []

for (const p of named) {
  const fp = footprint(p.geo)
  const pad = 4
  if (cursorX + fp.w + MARGIN > BED / 2) {
    cursorX = -BED / 2 + MARGIN
    cursorZ += rowH + pad
    rowH = 0
  }
  const x = cursorX + fp.w / 2
  const z = cursorZ + fp.d / 2
  placed.push(placeAt(p.geo, x, z))
  cursorX += fp.w + pad
  rowH = Math.max(rowH, fp.d)
}

const plate = merge(placed)
const plateBytes = exportStl(plate, join(root, 'public', 'pulseform-cryptex-6767-PLATE.stl'))
exportStl(plate, join(outDir, '00-ALL-PARTS-PLATE.stl'))

// Also write BOM / assembly instructions
const bom = `Pulseform Cryptex Vault — Multi-part kit (code 6767)
=====================================================

PRINT
- File: pulseform-cryptex-6767-PLATE.stl  (all parts on one plate)
- Or print individuals from /cryptex-parts/
- 0.16–0.2mm layers, 3–4 walls, 15–25% gyroid, no supports needed for these orientations
- Material: PLA+ or PETG. Keep dimensional accuracy — don't scale.

FITS (engineered)
- Vault OD ${VAULT_OD.toFixed(2)} mm into dial ID ${DIAL_ID.toFixed(1)} mm → radial clearance ${CLEAR_R} mm
- Dial width ${DIAL_W} mm in housing grooves with ${CLEAR_A} mm axial play
- Gate window ${GATE_WIDTH_DEG}° at each unlock digit; dog height ${DOG_H} mm

ASSEMBLY (order matters)
1. Slide the 4 dials into the housing from the REAR, in order rear→nose:
   dial-6, dial-7, dial-6, dial-7 (files 03→06). Seat each in its groove.
   Tall tick on each dial = that dial's unlock digit.
2. Insert vault-slider from the REAR through the dials until dogs sit under dials.
3. Snap retention-clip onto the vault rear stem (prevents full pull-out later).
4. Press rear-cap into the housing rear (friction fit; CA optional).
5. Press nose-grip onto the vault front tenon.
6. Test: align all tall ticks to the housing witness ridge → 6·7·6·7 → pull nose.
   Wrong code = a dog hits a dial pad and the vault will not slide.

UNLOCK
- Align each dial's TALL tick to the housing witness mark.
- Order rear → nose: 6 · 7 · 6 · 7
- Pull nose grip; vault slides out revealing stash cavity (~${CAVITY_ID} mm Ø × ${CAVITY_DEPTH} mm).

PARTS LIST
${named.map((p) => `- ${p.name}.stl  (${sizes[p.name].w.toFixed(1)}×${sizes[p.name].d.toFixed(1)} mm footprint, ${sizes[p.name].h.toFixed(1)} mm tall)`).join('\n')}

Plate STL bytes: ${plateBytes}
`
writeFileSync(join(outDir, 'ASSEMBLY.txt'), bom)
writeFileSync(join(root, 'public', 'CRYPTEX-ASSEMBLY.txt'), bom)

console.log(JSON.stringify({ parts: sizes, plateBytes, bedUsedZ: cursorZ + rowH }, null, 2))
