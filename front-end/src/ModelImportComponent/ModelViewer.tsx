import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, PerspectiveCamera, Bounds } from "@react-three/drei"
import { Suspense, useState, useRef, useEffect, cloneElement, isValidElement } from "react"

export default function ModelViewer({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  // Handle loading state changes with a small delay to ensure everything is rendered
  const handleLoadingChange = (loading: boolean) => {
    console.log("Loading state changed:", loading)
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!loading && !isReady) {
      // Add a delay after loading completes to ensure everything is fully rendered.
      timeoutRef.current = setTimeout(() => {
        console.log("Model loaded, enabling controls")
        setIsLoading(false)
        setIsReady(true)
        timeoutRef.current = null
      }, 1300)
    } else if (loading) {
      setIsLoading(true)
      setIsReady(false)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Clone children to pass loading callback
  const childrenWithCallback = isValidElement(children)
    ? cloneElement(children as any, { onLoadingChange: handleLoadingChange })
    : children

  // if callback never fires, auto-disable loading after 10 seconds
  useEffect(() => {
    if (isLoading) {
      const fallbackTimeout = setTimeout(() => {
        console.warn("Loading timeout - enabling controls anyway")
        setIsLoading(false)
        setIsReady(true)
      }, 10000)
      return () => clearTimeout(fallbackTimeout)
    }
  }, [isLoading])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto w-[min(100vw)] h-[min(100vh)]">
          <Canvas className="w-full h-full rounded-xl shadow-lg" shadows>
            <color attach="background" args={["#f4f4f5"]} />
            <hemisphereLight intensity={1.2} groundColor="#ffffff" />
            <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
            <Environment preset="city" />
            <PerspectiveCamera makeDefault fov={70} near={0.1} far={5000} position={[50, 130, 90]} />
            <OrbitControls
              makeDefault
              target={[0, 0, 0]}
              enableRotate={isReady}
              enableZoom={false}
              enablePan={isReady}
              screenSpacePanning={false}
            />
            <Suspense fallback={null}>
              <Bounds fit observe margin={3}>{childrenWithCallback}</Bounds>
            </Suspense>
          </Canvas>
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-4 bg-white bg-opacity-80 rounded-lg p-8 shadow-lg">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Loading 3D Model...</p>
          </div>
        </div>
      )}
    </div>
  )
}