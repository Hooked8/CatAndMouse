import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { buildExportGeometry } from './buildFigure'
import type { DesignSpec } from './designs'

export function designToStl(spec: DesignSpec): string {
  const geo = buildExportGeometry(spec)
  const mesh = new THREE.Mesh(geo)
  const exporter = new STLExporter()
  const stl = exporter.parse(mesh, { binary: false })
  geo.dispose()
  return stl
}

export function downloadStl(spec: DesignSpec) {
  const stl = designToStl(spec)
  const blob = new Blob([stl], { type: 'model/stl' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safe = spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  a.href = url
  a.download = `${safe}-${spec.id}.stl`
  a.click()
  URL.revokeObjectURL(url)
}
