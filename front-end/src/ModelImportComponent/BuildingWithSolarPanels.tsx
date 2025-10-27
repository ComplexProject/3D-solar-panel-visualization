import { useMemo, useState, useCallback } from "react"
import { Box3, Matrix3, Object3D, Quaternion, Raycaster, Vector3 } from "three"
import { useGLTF } from "@react-three/drei"
import BuildingModel from "./BuildingModel"
import SolarPanels from "./SolarPanels"

const BUILDING_URL = "/models/Building/scene.gltf"       
const PANEL_URL    = "/models/SolarPanel/scene.gltf"     

const BASE_PANEL_SCALE: [number, number, number] = [1, 1, 1] 
const ROOF_MARGIN_X = 0.5      
const ROOF_MARGIN_Z = 0.5      
const PANEL_LIFT    = 0.05     
const TARGET_ACROSS = 16       
const UPSCALE_PANELS = false 
const MAX_PANELS = 50         

const USE_FIXED_GRID = false
const FIXED_COLS = 8  
const FIXED_ROWS = 3  


function pickRoofTop(root: Object3D | null): Object3D | null {
  if (!root) return null
  const modelBox = new Box3().setFromObject(root)
  const topY = modelBox.max.y
  const up = new Vector3(0, 1, 0)
  const n = new Vector3()
  const nmat = new Matrix3()
  let best: { mesh: Object3D | null; score: number } = { mesh: null, score: -Infinity }

  root.traverse((o: any) => {
    if (!o?.isMesh || !o.geometry) return
    const box = new Box3().setFromObject(o)

    // Only consider meshes very close to the very top of the whole model.
    const modelH = Math.max(1e-6, modelBox.max.y - modelBox.min.y)
    const nearTop = Math.abs(box.max.y - topY) <= 0.02 * modelH
    if (!nearTop) return

    const normals = o.geometry.getAttribute("normal")
    if (!normals) return

    // how much the normals point upward on average.
    nmat.getNormalMatrix(o.matrixWorld)
    let upness = 0
    const step = Math.max(1, Math.floor(normals.count / 2000)) 
    for (let i = 0; i < normals.count; i += step) {
      n.set(normals.getX(i), normals.getY(i), normals.getZ(i)).applyMatrix3(nmat).normalize()
      upness += Math.max(0, n.dot(up))
    }

    // Favor larger flat-ish areas near the top.
    const areaXZ = Math.max(1e-6, (box.max.x - box.min.x) * (box.max.z - box.min.z))
    const score = upness * areaXZ
    if (score > best.score) best = { mesh: o, score }
  })

  return best.mesh
}

// 
// Load the panel once and extract:
// - panel width (X), depth (Z), and the "thin axis" (tAxis) used to align to roof normals.
// 
function usePanelFootprint(url: string) {
  const gltf = useGLTF(url) as any
  return useMemo(() => {
    if (!gltf?.scene) return null
    let mesh: any = null
    gltf.scene.traverse((o: any) => { if (!mesh && o.isMesh) mesh = o })
    if (!mesh) return null

    const box = new Box3().setFromObject(mesh)
    const size = box.getSize(new Vector3())

    // We consider the SMALLEST model dimension as the "thin axis".
    // Panels are flat, so that axis should align with a roof normal after rotation.
    const dims: [number, number, number] = [size.x, size.y, size.z]
    const minIdx = dims.indexOf(Math.min(...dims))
    const tAxis =
      minIdx === 0 ? new Vector3(1, 0, 0)
    : minIdx === 1 ? new Vector3(0, 1, 0)
                   : new Vector3(0, 0, 1)

    return {
      widthX: Math.max(1e-6, size.x),
      depthZ: Math.max(1e-6, size.z),
      tAxis,            // local "thin axis" used for alignment
      minY: box.min.y,  // used to float the panel just above the roof (prevents clipping)
    }
  }, [gltf])
}


export default function BuildingWithSolarPanels() {
  const [house, setHouse] = useState<Object3D | null>(null)
  const captureHouse = useCallback((o: Object3D | null) => setHouse(o), [])
  const panel = usePanelFootprint(PANEL_URL)

  const data = useMemo(() => {
    // No building or no panel yet -> nothing to place.
    if (!house || !panel) {
      return {
        positions: [] as [number, number, number][],
        orientations: [] as Quaternion[],
        scale: BASE_PANEL_SCALE,
      }
    }

    const roof = pickRoofTop(house)
    if (!roof) return { positions: [], orientations: [], scale: BASE_PANEL_SCALE }

    // (keeps panels from hanging over edges).
    const roofBox = new Box3().setFromObject(roof)
    let xMin = roofBox.min.x + ROOF_MARGIN_X
    let xMax = roofBox.max.x - ROOF_MARGIN_X
    let zMin = roofBox.min.z + ROOF_MARGIN_Z
    let zMax = roofBox.max.z - ROOF_MARGIN_Z

    const widthX0 = Math.max(0, xMax - xMin)
    const depthZ0 = Math.max(0, zMax - zMin)
    if (widthX0 <= 0 || depthZ0 <= 0) return { positions: [], orientations: [], scale: BASE_PANEL_SCALE }

    // Panel size BEFORE our fitting scale.
    const baseX = panel.widthX * Math.abs(BASE_PANEL_SCALE[0])
    const baseZ = panel.depthZ * Math.abs(BASE_PANEL_SCALE[2])

    // Decide which roof side is longer (X or Z). We fit "TARGET_ACROSS" along that long side.
    const longIsX = widthX0 >= depthZ0
    const acrossSpan = longIsX ? widthX0 : depthZ0
    const baseAcross = longIsX ? baseX : baseZ

    // FIXED GRID mode: ignore auto-scaling and use your numbers.
    let cols: number, rows: number, scale = [...BASE_PANEL_SCALE] as [number, number, number]
    if (USE_FIXED_GRID) {
      cols = Math.max(1, FIXED_COLS)
      rows = Math.max(1, FIXED_ROWS)
      
    } else {
      // AUTO FIT: choose scale so we can fit TARGET_ACROSS panels across the long side.
      const T = Math.max(1, Math.floor(TARGET_ACROSS))
      let s = acrossSpan / (T * baseAcross)     // scale needed to reach T across
      if (!UPSCALE_PANELS) s = Math.min(1, s)   // optional clamp: never enlarge
      s = Math.max(0.001, s)                    // avoid zero/negatives
      scale = [Math.abs(BASE_PANEL_SCALE[0]) * s, BASE_PANEL_SCALE[1], Math.abs(BASE_PANEL_SCALE[2]) * s]

      // Effective panel size *after* the chosen scale.
      const effX = panel.widthX * scale[0]
      const effZ = panel.depthZ * scale[2]

      // Center the first/last panel by removing half a panel at each side.
      xMin += effX / 2; xMax -= effX / 2
      zMin += effZ / 2; zMax -= effZ / 2

      const widthX = Math.max(0, xMax - xMin)
      const depthZ = Math.max(0, zMax - zMin)
      if (widthX <= 0 || depthZ <= 0) return { positions: [], orientations: [], scale }

      // Grid dims:
      cols = longIsX ? T : Math.max(1, Math.round(widthX / effX))
      rows = longIsX ? Math.max(1, Math.round(depthZ / effZ)) : T
    }

    // Safety cap.
    const total = Math.min(MAX_PANELS, rows * cols)

    // Step spacing from min to max (0 when there’s only 1).
    const stepX = cols > 1 ? (xMax - xMin) / (cols - 1) : 0
    const stepZ = rows > 1 ? (zMax - zMin) / (rows - 1) : 0

    // For each grid cell: drop a ray from above -> find roof point + normal.
    // Then: place panel slightly above (PANEL_LIFT) and rotate so "thin axis" faces the roof normal.
    const ray = new Raycaster()
    const modelSizeY = new Box3().setFromObject(house).getSize(new Vector3()).y
    const castHeight = modelSizeY + 10 
    const lift = PANEL_LIFT + (-panel.minY * Math.abs(scale[1])) 

    const up = new Vector3(0, 1, 0)
    const positions: [number, number, number][] = []
    const orientations: Quaternion[] = []

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (positions.length >= total) break

        const x = xMin + (cols === 1 ? 0 : c * stepX)
        const z = zMin + (rows === 1 ? 0 : r * stepZ)

        ray.set(new Vector3(x, roofBox.max.y + castHeight, z), new Vector3(0, -1, 0))
        const hits = ray.intersectObject(roof as any, true)
        if (!hits.length) continue

        const hit = hits[0]
        const normal = hit.face?.normal
          ? hit.face.normal.clone().transformDirection((hit.object as any).matrixWorld).normalize()
          : up

        // Panels need to be on flat surface.
        if (normal.dot(up) < 0.6) continue

        // Final position + orientation:
        const p = hit.point.clone().addScaledVector(up, lift)
        const q = new Quaternion().setFromUnitVectors(panel.tAxis.clone().normalize(), normal)

        positions.push([p.x, p.y, p.z])
        orientations.push(q)
      }
    }

    return { positions, orientations, scale }
  }, [house, panel])

  return (
    <group>
      <BuildingModel key={BUILDING_URL} ref={captureHouse} url={BUILDING_URL} />
      {house && data.positions.length > 0 && (
        <SolarPanels
          url={PANEL_URL}
          positions={data.positions}
          orientations={data.orientations}
          defaultScale={data.scale}
        />
      )}
    </group>
  )
}