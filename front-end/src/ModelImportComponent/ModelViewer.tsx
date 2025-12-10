import { Canvas, useThree } from "@react-three/fiber"
import { Environment, OrbitControls, PerspectiveCamera, Bounds } from "@react-three/drei"
import { Suspense, useState, useRef, useEffect, cloneElement, isValidElement } from "react"

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
        const zoomSpeed = 0.7
        const distance = camera.position.distanceTo(controlsRef.current.target)
        const newDistance = distance + delta * zoomSpeed * 0.01

        // zoom distance
        const minDistance = 5
        const maxDistance = 30
        const clampedDistance = Math.max(minDistance, Math.min(maxDistance, newDistance))

        // Zoom by moving camera along the line from target to camera
        const direction = camera.position.clone().sub(controlsRef.current.target).normalize()
        camera.position
          .copy(controlsRef.current.target)
          .add(direction.multiplyScalar(clampedDistance))
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
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!loading && !isReady) {
      // Add a delay after loading completes to ensure everything is fully rendered.
      timeoutRef.current = setTimeout(() => {
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
      const fallbackTimeout = window.setTimeout(() => {
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
            <PerspectiveCamera
              makeDefault
              fov={45}
              near={0.1}
              far={1000}
              position={[30, 40, 30]}
            />
            <OrbitControlsWithShiftZoom
              makeDefault
              target={[0, 0, 0]}
              enableRotate={isReady}
              enableZoom={false}
              enablePan={false}
              screenSpacePanning={false}
            />
            <Bounds fit observe margin={0.2}>
              <mesh position={[0, 45, 0]} visible={false}>
                <boxGeometry args={[1, 1, 1]} />
              </mesh>
              {childrenWithCallback}
            </Bounds>
          </Canvas>
        </div>
      </div>

      {isReady && (
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
            <span>
              Hold{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-800 text-white border border-gray-600 rounded text-xs font-mono">
                Shift
              </kbd>

              + Scroll to zoom
            </span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-4 bg-white bg-opacity-80 rounded-lg p-8 shadow-lg">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#006FAA] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Loading 3D Model...</p>
          </div>
        </div>
      )}
    </div>
  )
}
