import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, PerspectiveCamera, Bounds } from "@react-three/drei"
import { Suspense } from "react"

export default function ModelViewer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto w-[min(90vw,1600px)] h-[min(90vh,1000px)]">
          <Canvas className="w-full h-full rounded-xl shadow-lg" shadows>
        <color attach="background" args={["#f4f4f5"]} />
        <hemisphereLight intensity={1.2} groundColor="#ffffff" />
        <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
        <Environment preset="city" />
        <PerspectiveCamera makeDefault fov={60} near={0.1} far={5000} />
        <OrbitControls makeDefault minDistance={3} maxDistance={25} zoomSpeed={3} enableDamping dampingFactor={0.08} />
        <Suspense fallback={null}>
          <Bounds fit observe margin={3}>{children}</Bounds>
        </Suspense>
      </Canvas>
        </div>
      </div>
    </div>
  )
}