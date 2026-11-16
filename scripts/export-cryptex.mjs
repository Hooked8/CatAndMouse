import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const LOCK_CODE = [6, 7, 6, 7]
const CLEARANCE = 0.4
const OUTER_R = 28
const DIAL_W = 14
const DIAL_N = 4
const CAVITY_R = 11
const CAVITY_DEPTH = 42

function cyl(r, h, x, y, z, seg = 48) {
  const g = new THREE.CylinderGeometry(r, r, h, seg)
  g.rotateX(Math.PI / 2)
  g.translate(x, y, z)
  return g
}
function box(w, h, d, x, y, z) {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(x, y, z)
  return g
}
function digitAngle(digit) {
  return (digit / 10) * Math.PI * 2
}

function build() {
  const geos = []
  const dialSpan = DIAL_N * DIAL_W
  const noseLen = 18
  const tailLen = 22
  const dialStartZ = -dialSpan / 2

  // Tail housing
  geos.push(cyl(OUTER_R, tailLen, 0, 0, dialStartZ - tailLen / 2))
  // Front collar
  geos.push(cyl(OUTER_R, noseLen * 0.45, 0, 0, dialStartZ + dialSpan + noseLen * 0.22))
  // Witness
  geos.push(box(3.2, OUTER_R + 2.2, 8, 0, OUTER_R * 0.55, dialStartZ - tailLen * 0.45))

  // Rails
  const railR = OUTER_R - 7.5
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    geos.push(cyl(1.35, dialSpan + 6, Math.cos(a) * railR, Math.sin(a) * railR, dialStartZ + dialSpan / 2, 12))
  }

  // Dials
  for (let i = 0; i < DIAL_N; i++) {
    const z = dialStartZ + DIAL_W * (i + 0.5)
    const dialOuter = OUTER_R - 0.15
    const dialInner = OUTER_R - 6.2
    const codeDigit = LOCK_CODE[i]
    geos.push(cyl(dialOuter, DIAL_W - CLEARANCE * 2, 0, 0, z, 64))
    geos.push(cyl(dialInner + 0.8, DIAL_W - CLEARANCE * 2.4, 0, 0, z, 48))

    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2
      geos.push(
        box(2.2, 2.4, DIAL_W - 3, Math.cos(a) * (dialOuter + 0.6), Math.sin(a) * (dialOuter + 0.6), z),
      )
    }

    for (let d = 0; d < 10; d++) {
      const a = digitAngle(d) + Math.PI / 2
      const isCode = d === codeDigit
      const len = isCode ? 5.5 : 3.2
      const thick = isCode ? 2.2 : 1.3
      geos.push(
        box(
          thick,
          len,
          1.4,
          Math.cos(a) * (dialOuter - 1.2),
          Math.sin(a) * (dialOuter - 1.2),
          z + DIAL_W * 0.28 - CLEARANCE,
        ),
      )
      geos.push(
        box(1.1, 1.1, 0.9, Math.cos(a) * (dialOuter - 3.5), Math.sin(a) * (dialOuter - 3.5), z - DIAL_W * 0.22),
      )
    }

    const ga = digitAngle(codeDigit) + Math.PI / 2
    geos.push(
      box(4.5, 3.2, DIAL_W - CLEARANCE * 2.5, Math.cos(ga) * (dialInner + 1.6), Math.sin(ga) * (dialInner + 1.6), z),
    )
  }

  // Vault core
  const coreR = OUTER_R - 7.0 - CLEARANCE
  const coreLen = dialSpan + noseLen * 0.85
  const coreZ = dialStartZ + coreLen / 2 - 2
  geos.push(cyl(coreR, coreLen, 0, 0, coreZ, 48))
  geos.push(
    cyl(CAVITY_R, CAVITY_DEPTH, 0, 0, dialStartZ + dialSpan + noseLen * 0.15 - CAVITY_DEPTH / 2, 36),
  )

  for (let i = 0; i < DIAL_N; i++) {
    const z = dialStartZ + DIAL_W * (i + 0.5)
    const codeDigit = LOCK_CODE[i]
    const a = digitAngle(codeDigit) + Math.PI / 2
    const dogR = coreR + 1.8
    geos.push(box(3.6, 2.8, DIAL_W - 3.2, Math.cos(a) * dogR, Math.sin(a) * dogR, z))
  }

  geos.push(cyl(OUTER_R - 1.5, 10, 0, 0, dialStartZ + dialSpan + noseLen * 0.55, 48))
  geos.push(cyl(coreR + 2.5, 3.5, 0, 0, dialStartZ - 1.5, 40))
  geos.push(box(6, 4, 16, 0, OUTER_R - 2, dialStartZ - tailLen + 6))
  geos.push(cyl(5, 8, 0, OUTER_R + 2, dialStartZ - tailLen + 10, 20))

  const merged = mergeGeometries(geos, false)
  geos.forEach((g) => g.dispose())
  merged.rotateX(-Math.PI / 2)
  merged.computeBoundingBox()
  const bb = merged.boundingBox
  merged.translate(0, -bb.min.y, 0)
  const cx = (bb.min.x + bb.max.x) / 2
  const cz = (bb.min.z + bb.max.z) / 2
  merged.translate(-cx, 0, -cz)
  merged.computeVertexNormals()
  return merged
}

const geo = build()
const mesh = new THREE.Mesh(geo)
const exporter = new STLExporter()
const stl = exporter.parse(mesh, { binary: false })
mkdirSync(join(root, 'public'), { recursive: true })
const out = join(root, 'public', 'pulseform-cryptex-6767.stl')
writeFileSync(out, stl)
console.log('Wrote', out, 'bytes', stl.length)
geo.dispose()
