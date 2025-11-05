import { forwardRef } from "react"
import { useGLTF } from "@react-three/drei"
import type { Object3D } from "three"

type Props = { url: string }

const BuildingModel = forwardRef<Object3D, Props>(({ url }, ref) => {
  const gltf = useGLTF(url) as any
  return gltf?.scene ? <primitive ref={ref as any} object={gltf.scene} dispose={null} /> : null
})

export default BuildingModel