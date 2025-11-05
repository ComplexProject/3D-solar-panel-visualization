import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { Mesh, Material, Quaternion } from "three"

type Props = {
  url: string
  positions: [number, number, number][]
  defaultScale?: [number, number, number]
  meshName?: string
  orientation?: Quaternion
  orientations?: Quaternion[]
}

export default function SolarPanels({
  url,
  positions,
  defaultScale = [1, 1, 1],
  meshName,
  orientation,
  orientations,
}: Props) {
  const gltf = useGLTF(url) as any

  const base = useMemo(() => {
    if (!gltf?.scene) return null
    let m: Mesh | null = meshName
      ? (gltf.scene.getObjectByName(meshName) as Mesh)
      : null
    if (!m) gltf.scene.traverse((o: any) => { if (!m && o.isMesh) m = o })
    if (!m?.geometry || !m?.material) return null
    const mat: Material = Array.isArray(m.material) ? m.material[0] : m.material
    return { geometry: m.geometry, material: mat }
  }, [gltf, meshName])

  if (!base || positions.length === 0) return null

  return (
    <group>
      {positions.map(([x, y, z], i) => {
        const q = (orientations && orientations[i]) || orientation
        return (
          <mesh
            key={i}
            geometry={base.geometry}
            material={base.material}
            position={[x, y, z]}
            quaternion={(q as any) || undefined}
            scale={defaultScale}
            frustumCulled={false}
          />
        )
      })}
    </group>
  )
}