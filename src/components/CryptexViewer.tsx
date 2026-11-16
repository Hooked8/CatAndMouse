import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { buildCryptexGroup } from '../lib/cryptex'

function CryptexModel() {
  const group = useMemo(() => buildCryptexGroup(), [])

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

  return <primitive object={group} position={[0, -0.1, 0]} scale={0.028} />
}

export function CryptexViewer() {
  return (
    <div className="viewer">
      <Canvas
        camera={{ position: [3.2, 1.8, 3.4], fov: 40 }}
        dpr={1}
        frameloop="always"
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = 'none'
        }}
      >
        <color attach="background" args={['#0c1118']} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 6, 3]} intensity={1.2} />
        <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#7ec8ff" />
        <CryptexModel />
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={2}
          maxDistance={7}
          autoRotate
          autoRotateSpeed={0.55}
          target={[0, 0.9, 0]}
        />
      </Canvas>
      <div className="viewer-hint">Drag to inspect · Scroll to zoom</div>
    </div>
  )
}
