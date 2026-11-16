/**
 * Print-in-place cryptex STL — disconnected solids with FDM clearances.
 * Code: 6767
 */
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const CODE = [6, 7, 6, 7]
const GAP = 0.45
const OUTER_R = 30
const DIAL_W = 12
const DIAL_N = 4
const WALL = 2.4

function normalize(g) {
  const geo = g.index ? g.toNonIndexed() : g.clone()
  const pos = geo.attributes.position
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', pos.clone())
  g.dispose()
  if (geo !== g) geo.dispose()
  return out
}

function cylZ(r, h, z, seg = 48) {
  const g = new THREE.CylinderGeometry(r, r, h, seg)
  g.rotateX(Math.PI / 2)
  g.translate(0, 0, z)
  return normalize(g)
}

function box(w, h, d, x, y, z) {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(x, y, z)
  return normalize(g)
}

function digitAngle(d) {
  return (d / 10) * Math.PI * 2 + Math.PI / 2
}

function buildRingTube(outerR, innerR, h, z, seg = 56) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: false,
    steps: 1,
    curveSegments: seg,
  })
  geo.translate(0, 0, -h / 2 + z)
  return normalize(geo)
}

function merge(list) {
  const cleaned = list.filter(Boolean)
  const m = mergeGeometries(cleaned, false)
  cleaned.forEach((g) => g.dispose())
  if (!m) throw new Error('merge failed')
  return m
}

function build() {
  const solids = []
  const dialSpan = DIAL_N * DIAL_W
  const tail = 20
  const nose = 16
  const z0 = -dialSpan / 2

  // Housing
  const housing = []
  housing.push(buildRingTube(OUTER_R, OUTER_R - WALL - 1.5, tail, z0 - tail / 2))
  housing.push(cylZ(OUTER_R - 0.5, WALL, z0 - tail + WALL / 2, 40))
  housing.push(buildRingTube(OUTER_R, OUTER_R - WALL - 1.2, nose * 0.55, z0 + dialSpan + nose * 0.28))
  const railR = OUTER_R - 1.1
  for (const a of [-Math.PI / 2, 0, Math.PI]) {
    housing.push(box(3.2, 3.2, dialSpan + 4, Math.cos(a) * railR, Math.sin(a) * railR, z0 + dialSpan / 2))
  }
  housing.push(box(3.5, 3.8, 10, 0, OUTER_R + 0.5, z0 - tail * 0.4))
  housing.push(box(7, 5, 14, 0, OUTER_R - 1, z0 - tail + 8))
  solids.push(merge(housing))

  // Dials
  const dialOuter = OUTER_R - GAP - 0.8
  const dialInner = dialOuter - 5.5
  for (let i = 0; i < DIAL_N; i++) {
    const z = z0 + DIAL_W * (i + 0.5)
    const dialParts = []
    dialParts.push(buildRingTube(dialOuter, dialInner, DIAL_W - GAP * 2, z, 64))
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2
      dialParts.push(
        box(1.8, 1.8, DIAL_W - GAP * 2 - 2, Math.cos(a) * (dialOuter + 0.5), Math.sin(a) * (dialOuter + 0.5), z),
      )
    }
    for (let d = 0; d < 10; d++) {
      const a = digitAngle(d)
      const isCode = d === CODE[i]
      dialParts.push(
        box(
          isCode ? 2.4 : 1.2,
          isCode ? 4.8 : 2.8,
          1.2,
          Math.cos(a) * (dialOuter - 1.5),
          Math.sin(a) * (dialOuter - 1.5),
          z + (DIAL_W / 2 - GAP - 1.5),
        ),
      )
    }
    const ga = digitAngle(CODE[i])
    for (const side of [-1, 1]) {
      const a = ga + side * 0.22
      dialParts.push(
        box(2.2, 3.5, DIAL_W - GAP * 2 - 1, Math.cos(a) * (dialInner + 1.5), Math.sin(a) * (dialInner + 1.5), z),
      )
    }
    solids.push(merge(dialParts))
  }

  // Vault
  const vault = []
  const coreR = dialInner - GAP - 0.35
  const vaultLen = dialSpan + nose * 0.9
  const vaultZ = z0 + vaultLen / 2 - 1
  vault.push(cylZ(coreR, vaultLen, vaultZ, 48))
  const cavityR = 10.5
  const cavityDepth = 40
  const cavityZ = z0 + dialSpan + 2 - cavityDepth / 2
  vault.push(buildRingTube(coreR, cavityR, cavityDepth, cavityZ, 40))
  for (let i = 0; i < DIAL_N; i++) {
    const z = z0 + DIAL_W * (i + 0.5)
    const a = digitAngle(CODE[i])
    const dogR = coreR + 1.55
    vault.push(box(3.2, 2.4, DIAL_W - GAP * 2 - 2.5, Math.cos(a) * dogR, Math.sin(a) * dogR, z))
  }
  vault.push(cylZ(OUTER_R - 3, 9, z0 + dialSpan + nose * 0.55, 40))
  vault.push(cylZ(OUTER_R - 8, 6, z0 + dialSpan + nose * 0.55, 32))
  vault.push(cylZ(coreR + 2.2, 3.2, z0 - 2, 36))
  solids.push(merge(vault))

  const merged = merge(solids)
  merged.rotateX(-Math.PI / 2)
  merged.computeBoundingBox()
  const bb = merged.boundingBox
  merged.translate(0, -bb.min.y + 0.2, 0)
  const cx = (bb.min.x + bb.max.x) / 2
  const cz = (bb.min.z + bb.max.z) / 2
  merged.translate(-cx, 0, -cz)
  merged.computeVertexNormals()
  return merged
}

const geo = build()
const mesh = new THREE.Mesh(geo)
const stl = new STLExporter().parse(mesh, { binary: false })
mkdirSync(join(root, 'public'), { recursive: true })
const out = join(root, 'public', 'pulseform-cryptex-6767.stl')
writeFileSync(out, stl)
console.log('Wrote', out, 'bytes', Buffer.byteLength(stl))
geo.dispose()
