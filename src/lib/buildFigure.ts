import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { DesignSpec } from './designs'

type Part = { geo: THREE.BufferGeometry; color: string }

function box(w: number, h: number, d: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) {
  const g = new THREE.BoxGeometry(w, h, d)
  g.rotateX(rx)
  g.rotateY(ry)
  g.rotateZ(rz)
  g.translate(x, y, z)
  return g
}

function cyl(rTop: number, rBot: number, h: number, x: number, y: number, z: number, rx = 0, rz = 0, segments = 12) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, segments)
  g.rotateX(rx)
  g.rotateZ(rz)
  g.translate(x, y, z)
  return g
}

function sphere(r: number, x: number, y: number, z: number, w = 12, h = 10) {
  const g = new THREE.SphereGeometry(r, w, h)
  g.translate(x, y, z)
  return g
}

function cone(r: number, h: number, x: number, y: number, z: number, rx = 0, segments = 10) {
  const g = new THREE.ConeGeometry(r, h, segments)
  g.rotateX(rx)
  g.translate(x, y, z)
  return g
}

/** Build a printable, manifold-friendly figure as merged meshes per color group */
export function buildFigureParts(spec: DesignSpec): Part[] {
  const { proportions: p, features: f, palette, archetype } = spec
  const [cPrimary, cAccent, cLight] = palette
  const s = p.height
  const parts: Part[] = []

  const add = (color: string, ...geos: THREE.BufferGeometry[]) => {
    for (const geo of geos) parts.push({ geo, color })
  }

  // Base plinth
  if (f.base) {
    add(cLight, cyl(0.55 * s, 0.62 * s, 0.12 * s, 0, 0.06 * s, 0, 0, 0, 24))
    add(cAccent, cyl(0.42 * s, 0.42 * s, 0.04 * s, 0, 0.13 * s, 0, 0, 0, 24))
  }

  const footY = f.base ? 0.18 * s : 0.05 * s

  // Legs
  const legH = 0.55 * s * p.limb
  const legX = 0.16 * s
  add(
    cPrimary,
    cyl(0.1 * s * p.armor, 0.12 * s * p.armor, legH, -legX, footY + legH / 2, 0),
    cyl(0.1 * s * p.armor, 0.12 * s * p.armor, legH, legX, footY + legH / 2, 0),
  )
  // Boots
  add(
    cAccent,
    box(0.22 * s, 0.12 * s, 0.3 * s, -legX, footY + 0.05 * s, 0.04 * s),
    box(0.22 * s, 0.12 * s, 0.3 * s, legX, footY + 0.05 * s, 0.04 * s),
  )

  const hipY = footY + legH

  // Torso
  const torsoH = 0.55 * s * p.torso
  const torsoW = 0.42 * s * p.armor
  const torsoD = 0.28 * s * p.armor
  add(cPrimary, box(torsoW, torsoH, torsoD, 0, hipY + torsoH / 2, 0))

  // Chest plate
  add(
    cAccent,
    box(torsoW * 0.72, torsoH * 0.35, torsoD * 0.35, 0, hipY + torsoH * 0.62, torsoD * 0.4),
  )

  // Shoulders
  const shoulderY = hipY + torsoH * 0.85
  add(
    cLight,
    sphere(0.14 * s * p.armor, -torsoW * 0.55, shoulderY, 0, 10, 8),
    sphere(0.14 * s * p.armor, torsoW * 0.55, shoulderY, 0, 10, 8),
  )

  // Arms
  const armLen = 0.48 * s * p.limb
  const armAngle = archetype === 'street-racer' ? 0.55 : 0.25
  add(
    cPrimary,
    cyl(0.08 * s, 0.09 * s, armLen, -torsoW * 0.7, shoulderY - armLen * 0.35, 0.05 * s, 0, armAngle),
    cyl(0.08 * s, 0.09 * s, armLen, torsoW * 0.7, shoulderY - armLen * 0.35, 0.05 * s, 0, -armAngle),
  )
  // Hands / fists
  add(
    cAccent,
    sphere(0.09 * s, -torsoW * 0.85, shoulderY - armLen * 0.75, 0.08 * s, 8, 6),
    sphere(0.09 * s, torsoW * 0.85, shoulderY - armLen * 0.75, 0.08 * s, 8, 6),
  )

  // Neck + head
  const neckY = hipY + torsoH
  add(cLight, cyl(0.08 * s, 0.09 * s, 0.1 * s, 0, neckY + 0.05 * s, 0))
  const headR = 0.2 * s * p.head
  const headY = neckY + 0.12 * s + headR
  add(cLight, sphere(headR, 0, headY, 0, 14, 12))

  // Face mask / visor
  add(cAccent, box(headR * 1.2, headR * 0.45, headR * 0.35, 0, headY + headR * 0.05, headR * 0.75))

  // Helmet
  if (f.helmet) {
    add(cPrimary, sphere(headR * 1.12, 0, headY + headR * 0.08, 0, 14, 10))
    add(cAccent, box(headR * 1.4, headR * 0.2, headR * 0.9, 0, headY + headR * 0.55, headR * 0.2))
  }

  // Backpack / jetpack
  if (f.backpack) {
    add(cAccent, box(0.28 * s, 0.32 * s, 0.16 * s, 0, hipY + torsoH * 0.55, -torsoD * 0.75))
    add(
      cPrimary,
      cyl(0.06 * s, 0.07 * s, 0.28 * s, -0.1 * s, hipY + torsoH * 0.35, -torsoD * 0.95),
      cyl(0.06 * s, 0.07 * s, 0.28 * s, 0.1 * s, hipY + torsoH * 0.35, -torsoD * 0.95),
    )
  }

  // Cape
  if (f.cape) {
    add(
      cAccent,
      box(0.5 * s, 0.7 * s * p.torso, 0.04 * s, 0, hipY + torsoH * 0.35, -torsoD * 0.65, 0.35, 0, 0),
    )
  }

  // Wings
  if (f.wings) {
    add(
      cLight,
      box(0.55 * s, 0.08 * s, 0.28 * s, -0.45 * s, shoulderY, -0.1 * s, 0, 0, 0.4),
      box(0.55 * s, 0.08 * s, 0.28 * s, 0.45 * s, shoulderY, -0.1 * s, 0, 0, -0.4),
    )
  }

  // Horns
  if (f.horns) {
    add(
      cAccent,
      cone(0.05 * s, 0.22 * s, -headR * 0.55, headY + headR * 0.85, 0, 0),
      cone(0.05 * s, 0.22 * s, headR * 0.55, headY + headR * 0.85, 0, 0),
    )
  }

  // Tail
  if (f.tail) {
    add(
      cPrimary,
      cyl(0.04 * s, 0.08 * s, 0.45 * s, 0, hipY + 0.1 * s, -0.35 * s, 1.1, 0, 8),
    )
    add(cAccent, sphere(0.07 * s, 0, hipY - 0.05 * s, -0.55 * s, 8, 6))
  }

  // Weapon
  if (f.weapon) {
    const wx = torsoW * 0.95
    const wy = shoulderY - armLen * 0.55
    add(cAccent, cyl(0.025 * s, 0.025 * s, 0.55 * s, wx, wy + 0.1 * s, 0.2 * s, 0, 0.2))
    add(cLight, box(0.14 * s, 0.08 * s, 0.04 * s, wx, wy + 0.32 * s, 0.28 * s))
    if (archetype === 'fantasy-knight' || archetype === 'crystal-mage') {
      add(cAccent, cone(0.06 * s, 0.14 * s, wx, wy + 0.42 * s, 0.32 * s))
    }
  }

  // Archetype flourishes
  if (archetype === 'mech-guardian') {
    add(cLight, box(torsoW * 1.05, 0.08 * s, torsoD * 1.1, 0, hipY + torsoH * 0.3, 0))
  }
  if (archetype === 'cute-critter') {
    add(
      cAccent,
      sphere(0.08 * s, -headR * 0.7, headY + headR * 0.6, 0, 8, 6),
      sphere(0.08 * s, headR * 0.7, headY + headR * 0.6, 0, 8, 6),
    )
  }
  if (archetype === 'crystal-mage') {
    add(cAccent, cone(0.1 * s, 0.28 * s, 0, headY + headR * 1.2, 0))
  }
  if (archetype === 'dino-rider') {
    // Small companion mount blob at feet
    add(cPrimary, sphere(0.28 * s, 0.55 * s, footY + 0.22 * s, 0.1 * s, 12, 10))
    add(cAccent, cone(0.08 * s, 0.18 * s, 0.55 * s, footY + 0.48 * s, 0.1 * s))
  }
  if (archetype === 'steampunk-pilot') {
    add(cAccent, cyl(0.12 * s, 0.12 * s, 0.04 * s, 0, headY + headR * 0.2, headR * 0.9, Math.PI / 2, 0, 16))
  }

  return parts
}

export function buildFigureGroup(spec: DesignSpec): THREE.Group {
  const group = new THREE.Group()
  group.name = spec.name
  for (const part of buildFigureParts(spec)) {
    const mat = new THREE.MeshStandardMaterial({
      color: part.color,
      roughness: 0.45,
      metalness: 0.18,
    })
    const mesh = new THREE.Mesh(part.geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }
  return group
}

/** Merge all part geometries into one mesh for STL export (single solid) */
export function buildExportGeometry(spec: DesignSpec): THREE.BufferGeometry {
  const geos = buildFigureParts(spec).map((p) => {
    const g = p.geo.clone()
    return g
  })
  const merged = mergeGeometries(geos, false)
  for (const g of geos) g.dispose()
  if (!merged) {
    return new THREE.BoxGeometry(1, 1, 1)
  }
  // Scale to ~80mm tall for real-world print units (mm)
  merged.computeBoundingBox()
  const bb = merged.boundingBox!
  const height = bb.max.y - bb.min.y
  const targetMm = 80
  const scale = targetMm / Math.max(height, 0.001)
  merged.scale(scale, scale, scale)
  merged.translate(0, -bb.min.y * scale, 0)
  merged.computeVertexNormals()
  return merged
}
