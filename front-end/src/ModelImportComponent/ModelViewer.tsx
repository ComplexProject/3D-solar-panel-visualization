import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, PerspectiveCamera, Bounds } from "@react-three/drei"
import { Suspense, useState, useRef, useEffect, cloneElement, isValidElement } from "react"
import { useThree } from "@react-three/fiber"
import LoadingMessageModelViewer from "../statusMessageComponents/loadingMessage3DViewer"

// Custom OrbitControls component that enables zoom only when Shift is held
function OrbitControlsWithShiftZoom(props: any) {
  const controlsRef = useRef<any>(null)
  const { camera, gl } = useThree()

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey && controlsRef.current) {
        e.preventDefault()
        // Manually handle zoom when shift is pressed
        const delta = e.deltaY
        const zoomSpeed = 1
        const distance = camera.position.distanceTo(controlsRef.current.target)
        const newDistance = distance + delta * zoomSpeed * 0.01
        
        // zoom distance
        const minDistance = 20
        const maxDistance = 80
        const clampedDistance = Math.max(minDistance, Math.min(maxDistance, newDistance))
        
        // Zoom by moving camera along the line from target to camera
        const direction = camera.position.clone().sub(controlsRef.current.target).normalize()
        camera.position.copy(controlsRef.current.target).add(direction.multiplyScalar(clampedDistance))
        camera.updateProjectionMatrix()
      }
    }

    gl.domElement.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      gl.domElement.removeEventListener("wheel", handleWheel)
    }
  }, [camera, gl])

  return <OrbitControls ref={controlsRef} {...props} />
}

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
            <PerspectiveCamera makeDefault fov={70} near={0.1} far={3000} position={[45, 120, 180]} />
            <OrbitControlsWithShiftZoom
              makeDefault
              target={[0, 50, 0]}
              enableRotate={isReady}
              enableZoom={false}
              enablePan={false}
              screenSpacePanning={false}
            />
            <Suspense fallback={null}>
              <Bounds fit observe margin={3}>{childrenWithCallback}</Bounds>
            </Suspense>
          </Canvas>
        </div>
      </div>
      { !isLoading && (<LoadingMessageModelViewer />) }
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