import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { Mesh, Material, Quaternion, Group, Box3, Vector3 } from "three"

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

  // For multi-mesh models: clone entire scene, remove platform, wrap in group
  const isMultiMesh = useMemo(() => {
    if (!gltf?.scene) return false
    let count = 0
    gltf.scene.traverse((o: any) => { if (o.isMesh) count++ })
    return count > 1
  }, [gltf])

  // Create base cloned scene with platform removed (do this once in useMemo)
  const baseScene = useMemo(() => {
    if (!gltf?.scene || !isMultiMesh) return null
    
    const cloned = gltf.scene.clone(true)
    
    // Remove ONLY the solar panel's black platform (base plane) - NOT the building
    const toRemove: any[] = []
    cloned.traverse((child: any) => {
      if (child.isMesh) {
        const name = (child.name || "").toLowerCase()
        if (name === "plane_environment_0") {
          toRemove.push(child)
        }
      }
    })
    
    // Remove after traversal to avoid modifying while iterating
    toRemove.forEach(child => {
      if (child.parent) {
        child.parent.remove(child)
      }
    })
    
    // Reset scene transforms
    cloned.position.set(0, 0, 0)
    cloned.rotation.set(0, 0, 0)
    cloned.scale.set(1, 1, 1)
    cloned.updateMatrixWorld()
    
    
    return cloned
  }, [gltf, isMultiMesh])

  if (!gltf?.scene || positions.length === 0) {
    return null
  }

  if (isMultiMesh && baseScene) {
    return (
      <group>
        {positions.map(([x, y, z], i) => {
          const panelQuat = (orientations && orientations[i]) || orientation
          const instance = baseScene.clone(true)
          
          // Apply rotation only to the panel mesh, keeping base/pole completely fixed
          if (panelQuat) {
            instance.traverse((child: any) => {
              if (child.isMesh) {
                const name = (child.name || "").toLowerCase()
                // Find the panel mesh (not the removed platform, not the cylinder/pole)
                if (name.includes("plane") && !name.includes("plane_environment_0")) {
                  // Apply the azimuth/slope rotation to the panel mesh only
                  // This rotates the panel around its local origin (which should be at the pole connection)
                  child.quaternion.copy(panelQuat as any)
                }
              }
            })
          }
          
          return (
            <group
              key={`panel-${i}`}
              position={[x, y, z]}
              scale={defaultScale}
            >
              <primitive object={instance} />
            </group>
          )
        })}
      </group>
    )
  }


  // Single mesh: use original logic
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

  if (!base) {
    return null
  }

  return (
    <group>
      {positions.map(([x, y, z], i) => {
        const q = (orientations && orientations[i]) || orientation
        return (
          <mesh
            key={`mesh-${i}`}
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
