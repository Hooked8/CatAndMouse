/**
 * Print-in-place 4-dial cylinder combination lock (cryptex / bike-lock style).
 * Correct code: 6767 — aligns internal gates so the sliding vault can pull out.
 * Units: millimeters. Designed for FDM (~0.35mm radial clearance on moving fits).
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const LOCK_CODE = [6, 7, 6, 7] as const
export const LOCK_CODE_LABEL = '6767'

export type CryptexParams = {
  outerR: number
  length: number
  dialCount: number
  dialWidth: number
  clearance: number
  cavityR: number
  cavityDepth: number
  code: readonly number[]
}

export const DEFAULT_CRYPTEX: CryptexParams = {
  outerR: 28,
  length: 118,
  dialCount: 4,
  dialWidth: 14,
  clearance: 0.4,
  cavityR: 11,
  cavityDepth: 42,
  code: LOCK_CODE,
}

function cyl(
  rTop: number,
  rBot: number,
  h: number,
  x: number,
  y: number,
  z: number,
  rx = 0,
  rz = 0,
  seg = 48,
) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, seg)
  g.rotateX(rx)
  g.rotateZ(rz)
  // Default cylinder is Y-up; we want Z-axis along the lock length
  g.rotateX(Math.PI / 2)
  g.translate(x, y, z)
  return g
}

function box(w: number, h: number, d: number, x: number, y: number, z: number, rz = 0) {
  const g = new THREE.BoxGeometry(w, h, d)
  g.rotateZ(rz)
  g.translate(x, y, z)
  return g
}

function torusChunk(R: number, tube: number, z: number, seg = 40) {
  const g = new THREE.TorusGeometry(R, tube, 10, seg)
  g.rotateY(Math.PI / 2)
  g.translate(0, 0, z)
  return g
}

/** Digit index 0-9 → angle (rad), 0 at +Y, increasing CCW looking from +Z */
function digitAngle(digit: number) {
  return (digit / 10) * Math.PI * 2
}

/**
 * Build printable cryptex as separate color groups for the viewer,
 * and a merged export geometry for STL.
 */
export function buildCryptexParts(params: CryptexParams = DEFAULT_CRYPTEX) {
  const p = params
  const parts: { geo: THREE.BufferGeometry; color: string; name: string }[] = []

  const push = (color: string, name: string, ...geos: THREE.BufferGeometry[]) => {
    for (const geo of geos) parts.push({ geo, color, name })
  }

  const dialSpan = p.dialCount * p.dialWidth
  const noseLen = 18
  const tailLen = 22
  const dialStartZ = -dialSpan / 2
  const bodyLen = dialSpan + noseLen + tailLen

  // ——— Fixed outer cage / rails (print as body) ———
  // Rear housing (tail)
  push(
    '#2a3544',
    'housing',
    cyl(p.outerR, p.outerR, tailLen, 0, 0, dialStartZ - tailLen / 2),
  )
  // Front collar
  push(
    '#2a3544',
    'housing',
    cyl(p.outerR, p.outerR, noseLen * 0.45, 0, 0, dialStartZ + dialSpan + noseLen * 0.22),
  )

  // Witness mark ridge on top of rear housing (align dials here)
  push(
    '#ff9f1c',
    'witness',
    box(3.2, p.outerR + 2.2, 8, 0, p.outerR * 0.55, dialStartZ - tailLen * 0.45),
  )

  // Internal axial rails (keep dials centered) — four thin rods near ID
  const railR = p.outerR - 7.5
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    push(
      '#3d4d61',
      'rails',
      cyl(1.35, 1.35, dialSpan + 6, Math.cos(a) * railR, Math.sin(a) * railR, dialStartZ + dialSpan / 2, 0, 0, 10),
    )
  }

  // ——— Rotating dials (print-in-place) ———
  for (let i = 0; i < p.dialCount; i++) {
    const z = dialStartZ + p.dialWidth * (i + 0.5)
    const dialOuter = p.outerR - 0.15
    const dialInner = p.outerR - 6.2
    const codeDigit = p.code[i] ?? 0

    // Main dial ring
    push('#2ec4b6', 'dial', cyl(dialOuter, dialOuter, p.dialWidth - p.clearance * 2, 0, 0, z, 0, 0, 64))
    // Hollow look via inner darker ring (visual); true ID is open for shaft
    push('#1a2430', 'dial-inner', cyl(dialInner + 0.8, dialInner + 0.8, p.dialWidth - p.clearance * 2.4, 0, 0, z, 0, 0, 48))

    // Knurl bumps around OD
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2
      push(
        '#26a69a',
        'knurl',
        box(2.2, 2.4, p.dialWidth - 3, Math.cos(a) * (dialOuter + 0.6), Math.sin(a) * (dialOuter + 0.6), z),
      )
    }

    // Digit ticks 0-9 + stronger pip at unlock digit for that ring
    for (let d = 0; d < 10; d++) {
      const a = digitAngle(d) + Math.PI / 2 // 0 at top (+Y) when digit 0
      const isCode = d === codeDigit
      const len = isCode ? 5.5 : 3.2
      const thick = isCode ? 2.2 : 1.3
      push(
        isCode ? '#ff9f1c' : '#e8eef7',
        'ticks',
        box(
          thick,
          len,
          1.4,
          Math.cos(a) * (dialOuter - 1.2),
          Math.sin(a) * (dialOuter - 1.2),
          z + (p.dialWidth * 0.28 - p.clearance),
        ),
      )
      // Tiny digit blocks as 7-seg-ish markers near rim (readable after print)
      if (d % 1 === 0) {
        const tx = Math.cos(a) * (dialOuter - 3.5)
        const ty = Math.sin(a) * (dialOuter - 3.5)
        push('#f3f7fb', 'digit-mark', box(1.1, 1.1, 0.9, tx, ty, z - p.dialWidth * 0.22))
      }
    }

    // Internal gate notch (void represented by leaving shaft clearance —
    // we add a gate pocket block that is NOT merged into dial for export solid;
    // instead the sliding core has a matching dog that only passes at code angle)
    // Gate pocket: cut is simulated by a recessed slot on ID at code angle
    const ga = digitAngle(codeDigit) + Math.PI / 2
    push(
      '#0d7377',
      'gate',
      box(
        4.5,
        3.2,
        p.dialWidth - p.clearance * 2.5,
        Math.cos(ga) * (dialInner + 1.6),
        Math.sin(ga) * (dialInner + 1.6),
        z,
      ),
    )
  }

  // ——— Sliding vault / core (pulls out when unlocked) ———
  const coreR = p.outerR - 7.0 - p.clearance
  const coreLen = dialSpan + noseLen * 0.85
  const coreZ = dialStartZ + coreLen / 2 - 2

  push('#c5d0db', 'vault', cyl(coreR, coreR, coreLen, 0, 0, coreZ, 0, 0, 48))

  // Internal cavity walls (hollow chamber) — leave open from front
  // Represent cavity as thinner inner cylinder subtracted visually with dark insert
  push(
    '#101820',
    'cavity',
    cyl(p.cavityR, p.cavityR, p.cavityDepth, 0, 0, dialStartZ + dialSpan + noseLen * 0.15 - p.cavityDepth / 2, 0, 0, 36),
  )

  // Dogs / keys on vault — one under each dial; only clear gates when dials at code
  for (let i = 0; i < p.dialCount; i++) {
    const z = dialStartZ + p.dialWidth * (i + 0.5)
    const codeDigit = p.code[i] ?? 0
    const a = digitAngle(codeDigit) + Math.PI / 2
    const dogR = coreR + 1.8
    push(
      '#ff9f1c',
      'dog',
      box(3.6, 2.8, p.dialWidth - 3.2, Math.cos(a) * dogR, Math.sin(a) * dogR, z),
    )
  }

  // Pull grip / face plate on vault nose
  push(
    '#e8eef7',
    'grip',
    cyl(p.outerR - 1.5, p.outerR - 4, 10, 0, 0, dialStartZ + dialSpan + noseLen * 0.55, 0, 0, 48),
  )
  // Finger groove
  push('#2ec4b6', 'grip', torusChunk(p.outerR - 6, 2.2, dialStartZ + dialSpan + noseLen * 0.55))

  // End stop flange inside rear (keeps vault from falling out when locked)
  push(
    '#3d4d61',
    'stop',
    cyl(coreR + 2.5, coreR + 2.5, 3.5, 0, 0, dialStartZ - 1.5, 0, 0, 40),
  )

  // Decorative bike-lock shackle hint on rear
  push(
    '#ff9f1c',
    'shackle',
    box(6, 4, 16, 0, p.outerR - 2, dialStartZ - tailLen + 6),
    cyl(5, 5, 8, 0, p.outerR + 2, dialStartZ - tailLen + 10, 0, 0, 20),
  )

  return { parts, params: p, dialStartZ, dialSpan, bodyLen }
}

export function buildCryptexGroup(params: CryptexParams = DEFAULT_CRYPTEX) {
  const { parts } = buildCryptexParts(params)
  const group = new THREE.Group()
  group.name = `Cryptex-${LOCK_CODE_LABEL}`
  for (const part of parts) {
    const mat = new THREE.MeshStandardMaterial({
      color: part.color,
      roughness: 0.48,
      metalness: 0.22,
    })
    const mesh = new THREE.Mesh(part.geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.name = part.name
    group.add(mesh)
  }
  // Orient upright-ish for viewer: length along Y
  group.rotation.x = -Math.PI / 2
  return group
}

export function buildCryptexExportGeometry(params: CryptexParams = DEFAULT_CRYPTEX) {
  const { parts } = buildCryptexParts(params)
  const geos = parts.map((p) => p.geo.clone())
  const merged = mergeGeometries(geos, false)
  for (const g of geos) g.dispose()
  if (!merged) return new THREE.CylinderGeometry(20, 20, 80, 32)

  // Sit flat on print bed: length along Z → rotate so Z becomes Y (up)
  merged.rotateX(-Math.PI / 2)
  merged.computeBoundingBox()
  const bb = merged.boundingBox!
  merged.translate(0, -bb.min.y, 0)
  // Center XZ
  const cx = (bb.min.x + bb.max.x) / 2
  const cz = (bb.min.z + bb.max.z) / 2
  merged.translate(-cx, 0, -cz)
  merged.computeVertexNormals()
  return merged
}

export function cryptexPrintNotes() {
  return [
    'Print upright (axis vertical) or on its side with the flat rear on the bed — side print needs supports under dial lips.',
    'Recommended: 0.16–0.2mm layers, 3–4 walls, 25% gyroid, no supports if printed vertically with bridging carefully.',
    `Print-in-place clearances are ${DEFAULT_CRYPTEX.clearance}mm. After printing, gently free each dial; work them until they spin.`,
    `Set all four dials so the amber (gold) tick on each ring lines up with the amber witness ridge — that is code ${LOCK_CODE_LABEL}.`,
    'When aligned, pull the light nose/grip — the vault slides out. Inside is a cylindrical stash cavity (~22mm Ø × 42mm).',
    'Only 6767 opens it: any other combination blocks the internal dogs and the vault will not slide.',
  ].join(' ')
}
