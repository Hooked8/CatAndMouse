import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import { Suspense, useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { DesignSpec } from '../lib/designs'
import { buildFigureGroup } from '../lib/buildFigure'

function FigureModel({ spec }: { spec: DesignSpec }) {
  const group = useMemo(() => buildFigureGroup(spec), [spec])

  useLayoutEffect(() => {
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
  }, [group])

  return <primitive object={group} position={[0, -0.15, 0]} />
}

export function FigureViewer({ spec }: { spec: DesignSpec }) {
  return (
    <div className="viewer">
      <Canvas
        camera={{ position: [2.2, 1.6, 2.6], fov: 38 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0c1118']} />
        <ambientLight intensity={0.45} />
        <directionalLight castShadow position={[4, 6, 3]} intensity={1.35} />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#7ec8ff" />
        <Suspense fallback={null}>
          <FigureModel key={spec.id} spec={spec} />
          <ContactShadows position={[0, -0.02, 0]} opacity={0.45} scale={6} blur={2.5} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={1.6}
          maxDistance={5}
          autoRotate
          autoRotateSpeed={0.7}
          target={[0, 0.7, 0]}
        />
      </Canvas>
      <div className="viewer-hint">Drag to orbit · Scroll to zoom</div>
    </div>
  )
}
