import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { DesignSpec } from '../lib/designs'
import { buildFigureGroup } from '../lib/buildFigure'

function FigureModel({ spec }: { spec: DesignSpec }) {
  const group = useMemo(() => buildFigureGroup(spec), [spec])
  const invalidate = useThree((s) => s.invalidate)

  useLayoutEffect(() => {
    invalidate()
    return () => {
      group.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry?.dispose()
          const mat = mesh.material
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else (mat as THREE.Material | undefined)?.dispose?.()
        }
      })
    }
  }, [group, invalidate])

  return <primitive object={group} position={[0, -0.15, 0]} />
}

function SoftRotate() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let alive = true
    let frame = 0
    const tick = () => {
      if (!alive) return
      frame += 1
      // ~12 fps idle spin — cheap enough for phones
      if (frame % 5 === 0) invalidate()
      requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(id)
    }
  }, [invalidate])
  return null
}

export function FigureViewer({ spec }: { spec: DesignSpec }) {
  return (
    <div className="viewer">
      <Canvas
        camera={{ position: [2.2, 1.6, 2.6], fov: 38 }}
        dpr={1}
        frameloop="demand"
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = 'none'
        }}
      >
        <color attach="background" args={['#0c1118']} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 6, 3]} intensity={1.1} />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#7ec8ff" />
        <FigureModel key={spec.id} spec={spec} />
        <SoftRotate />
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={1.6}
          maxDistance={5}
          autoRotate
          autoRotateSpeed={0.8}
          target={[0, 0.7, 0]}
        />
      </Canvas>
      <div className="viewer-hint">Drag to orbit · Scroll to zoom</div>
    </div>
  )
}
