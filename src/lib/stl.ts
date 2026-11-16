import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { buildExportGeometry } from './buildFigure'
import { LOCK_CODE_LABEL, buildCryptexExportGeometry } from './cryptex'
import type { DesignSpec } from './designs'

function downloadTextStl(stl: string, filename: string) {
  const blob = new Blob([stl], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function designToStl(spec: DesignSpec): string {
  const geo = buildExportGeometry(spec)
  const mesh = new THREE.Mesh(geo)
  const exporter = new STLExporter()
  const stl = exporter.parse(mesh, { binary: false })
  geo.dispose()
  return stl
}

export function downloadStl(spec: DesignSpec) {
  try {
    const stl = designToStl(spec)
    const safe = spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    downloadTextStl(stl, `${safe}-${spec.id}.stl`)
  } catch (err) {
    console.error(err)
    window.alert('Could not build that STL. Generate a new design and try again.')
  }
}

export function cryptexToStl(): string {
  const geo = buildCryptexExportGeometry()
  const mesh = new THREE.Mesh(geo)
  const exporter = new STLExporter()
  const stl = exporter.parse(mesh, { binary: false })
  geo.dispose()
  return stl
}

export function downloadCryptexStl() {
  const stl = cryptexToStl()
  downloadTextStl(stl, `pulseform-cryptex-${LOCK_CODE_LABEL}.stl`)
}
