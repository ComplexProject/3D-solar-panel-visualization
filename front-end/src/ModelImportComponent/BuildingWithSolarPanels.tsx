import { useMemo, useState, useCallback, useEffect } from "react" 
import { Box3, BufferGeometry, Matrix3, Matrix4, Object3D, Quaternion, Vector3 } from "three"
import { useGLTF } from "@react-three/drei"
import BuildingModel from "./BuildingModel"
import SolarPanels from "./SolarPanels"

const BUILDING_URL = "/models/Building/building.gltf"
const PANEL_URL = "/models/SolarPanel/scene.gltf"

type PanelOverride = { azimuth?: number; slope?: number }
const DEG = Math.PI / 180

// Configuration constants
const BASE_PANEL_SCALE: [number, number, number] = [8, 8, 8]
const ROOF_MARGIN_X = 0
const ROOF_MARGIN_Z = 0.5
const PANEL_LIFT = 0.4
const PLANE_OFFSET_X = 1.5
const PLANE_OFFSET_Y = 0
const PLANE_OFFSET_Z = 0
const PANEL_GAP_X = 1.7
const PANEL_GAP_Z = 1.9
const TARGET_ACROSS = 8
const UPSCALE_PANELS = false
const MAX_PANELS = 50
const USE_FIXED_GRID = false
const FIXED_COLS = 8
const FIXED_ROWS = 3

// Fetches panel orientation overrides (azimuth/slope) from API
function usePanelOverrides() {
  const [overrides, setOverrides] = useState<PanelOverride[]>([])
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch("http://127.0.0.1:8510/getDummy")
        const json = await r.json()
        if (alive && Array.isArray(json?.solarPanels)) setOverrides(json.solarPanels as PanelOverride[])
      } catch {}
    }
    load()
    return () => { alive = false }
  }, [])
  return overrides
}

// Finds roof meshes by name or heuristics (largest upward-facing surface near top)
function pickRoofTop(root: Object3D | null): Object3D[] {
  if (!root) return []
  
  const roofMeshes: Object3D[] = []
  root.traverse((o: any) => {
    if (!o?.isMesh) return
    const name = (o.name || "").toLowerCase()
    if (name.includes("roof") || name.includes("rooftop")) {
      roofMeshes.push(o)
    }
  })
  
  if (roofMeshes.length > 0) return roofMeshes
  
  // Heuristic: find meshes near top with upward-facing normals
  const modelBox = new Box3().setFromObject(root)
  const topY = modelBox.max.y
  const up = new Vector3(0, 1, 0)
  const n = new Vector3()
  const nmat = new Matrix3()
  const candidates: { mesh: Object3D; score: number }[] = []

  root.traverse((o: any) => {
    if (!o?.isMesh || !o.geometry) return
    const box = new Box3().setFromObject(o)
    const modelH = Math.max(1e-6, modelBox.max.y - modelBox.min.y)
    if (Math.abs(box.max.y - topY) > 0.02 * modelH) return

    const normals = o.geometry.getAttribute("normal")
    if (!normals) return

    nmat.getNormalMatrix(o.matrixWorld)
    let upness = 0
    const step = Math.max(1, Math.floor(normals.count / 2000))
    for (let i = 0; i < normals.count; i += step) {
      n.set(normals.getX(i), normals.getY(i), normals.getZ(i)).applyMatrix3(nmat).normalize()
      upness += Math.max(0, n.dot(up))
    }

    const areaXZ = Math.max(1e-6, (box.max.x - box.min.x) * (box.max.z - box.min.z))
    const score = upness * areaXZ
    if (score > 0) candidates.push({ mesh: o, score })
  })

  if (candidates.length === 0) return []
  candidates.sort((a, b) => b.score - a.score)
  const threshold = candidates[0].score * 0.5
  return candidates.filter(c => c.score >= threshold).map(c => c.mesh)
}

// Extracts panel footprint dimensions and orientation axes
function usePanelFootprint(url: string) {
  const gltf = useGLTF(url) as any
  return useMemo(() => {
    if (!gltf?.scene) return null
    
    const sceneBox = new Box3().setFromObject(gltf.scene)
    let meshCount = 0
    gltf.scene.traverse((o: any) => { if (o.isMesh) meshCount++ })
    
    // For multi-mesh models, use only XZ footprint (ignore pole height)
    const box = meshCount > 1
      ? new Box3(new Vector3(sceneBox.min.x, 0, sceneBox.min.z), new Vector3(sceneBox.max.x, 0.1, sceneBox.max.z))
      : sceneBox

    const size = box.getSize(new Vector3())
    let normalizedSize = size.clone()
    let normalizationFactor = 1
    
    // Normalize if dimensions seem wrong (likely unit conversion issue)
    if (size.x > 100 || size.z > 100) {
      const maxDimension = Math.max(size.x, size.z)
      normalizationFactor = 4.0 / maxDimension
      normalizedSize.multiplyScalar(normalizationFactor)
    }

    const dims: [number, number, number] = [normalizedSize.x, normalizedSize.y, normalizedSize.z]
    const minIdx = dims.indexOf(Math.min(...dims))
    const tAxis = minIdx === 0 ? new Vector3(1, 0, 0) : minIdx === 1 ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1)

    return {
      widthX: Math.max(1e-6, normalizedSize.x),
      depthZ: Math.max(1e-6, normalizedSize.z),
      tAxis,
      uAxis: minIdx === 0 ? new Vector3(0, 0, 1) : minIdx === 1 ? new Vector3(1, 0, 0) : new Vector3(1, 0, 0),
      minY: box.min.y * normalizationFactor,
      normalizationFactor,
    }
  }, [gltf])
}

type BuildingWithSolarPanelsProps = {
  onLoadingChange?: (isLoading: boolean) => void
}

export default function BuildingWithSolarPanels({ onLoadingChange }: BuildingWithSolarPanelsProps = {}) {
  const [house, setHouse] = useState<Object3D | null>(null)
  const captureHouse = useCallback((o: Object3D | null) => setHouse(o), [])
  const panel = usePanelFootprint(PANEL_URL)
  const overrides = usePanelOverrides()

  const data = useMemo(() => {
    if (!house || !panel) {
      return { positions: [] as [number, number, number][], orientations: [] as Quaternion[], scale: BASE_PANEL_SCALE }
    }

    const roofMeshes = pickRoofTop(house)
    if (roofMeshes.length === 0) {
      return { positions: [], orientations: [], scale: BASE_PANEL_SCALE }
    }
    
    roofMeshes.forEach(roof => roof.updateMatrixWorld(true))
    
    // Extract vertices from roof geometry to find top surface
    const roofVertices: Vector3[] = []
    let maxY = -Infinity
    
    roofMeshes.forEach((roof: any) => {
      if (!roof.isMesh || !roof.geometry) return
      const geometry = roof.geometry as BufferGeometry
      const positionAttribute = geometry.getAttribute('position')
      if (!positionAttribute) return
      
      const vertex = new Vector3()
      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.set(positionAttribute.getX(i), positionAttribute.getY(i), positionAttribute.getZ(i))
        vertex.applyMatrix4(roof.matrixWorld)
        roofVertices.push(vertex.clone())
        maxY = Math.max(maxY, vertex.y)
      }
    })
    
    if (roofVertices.length === 0) {
      return { positions: [], orientations: [], scale: BASE_PANEL_SCALE }
    }
    
    // Filter vertices near top surface (excludes edges/gables)
    let topThreshold = 0.1
    let topVertices = roofVertices.filter(v => Math.abs(v.y - maxY) <= topThreshold)
    
    if (topVertices.length === 0) {
      const allY = roofVertices.map(v => v.y)
      maxY = Math.max(...allY)
      topThreshold = (Math.max(...allY) - Math.min(...allY)) * 0.05
      topVertices = roofVertices.filter(v => Math.abs(v.y - maxY) <= topThreshold)
    }
    
    // Calculate invisible plane boundaries from top surface vertices
    const topX = topVertices.map(v => v.x)
    const topZ = topVertices.map(v => v.z)
    const planeTopY = maxY + PLANE_OFFSET_Y
    const planeXMin = Math.min(...topX) + PLANE_OFFSET_X
    const planeXMax = Math.max(...topX) + PLANE_OFFSET_X
    const planeZMin = Math.min(...topZ) + PLANE_OFFSET_Z
    const planeZMax = Math.max(...topZ) + PLANE_OFFSET_Z
    
    // Apply margins and calculate available space
    const clampedXMin = Math.max(planeXMin, planeXMin + ROOF_MARGIN_X)
    const clampedXMax = Math.min(planeXMax, planeXMax - ROOF_MARGIN_X)
    const clampedZMin = Math.max(planeZMin, planeZMin + ROOF_MARGIN_Z)
    const clampedZMax = Math.min(planeZMax, planeZMax - ROOF_MARGIN_Z)
    const widthAvailable = Math.max(0, clampedXMax - clampedXMin)
    const depthAvailable = Math.max(0, clampedZMax - clampedZMin)
    
    if (widthAvailable <= 0 || depthAvailable <= 0) {
      return { positions: [], orientations: [], scale: BASE_PANEL_SCALE }
    }

    // Calculate panel grid dimensions
    const baseX = panel.widthX * Math.abs(BASE_PANEL_SCALE[0])
    const baseZ = panel.depthZ * Math.abs(BASE_PANEL_SCALE[2])
    const longIsX = widthAvailable >= depthAvailable
    const acrossSpan = longIsX ? widthAvailable : depthAvailable
    const baseAcross = longIsX ? baseX : baseZ

    let cols: number, rows: number
    let scale: [number, number, number] = [
      BASE_PANEL_SCALE[0] * panel.normalizationFactor,
      BASE_PANEL_SCALE[1] * panel.normalizationFactor,
      BASE_PANEL_SCALE[2] * panel.normalizationFactor
    ]
    
    let effX: number, effZ: number, stepX: number, stepZ: number, gridStartX: number, gridStartZ: number
    
    if (USE_FIXED_GRID) {
      cols = Math.max(1, FIXED_COLS)
      rows = Math.max(1, FIXED_ROWS)
      effX = panel.widthX * scale[0]
      effZ = panel.depthZ * scale[2]
      stepX = effX + PANEL_GAP_X
      stepZ = effZ + PANEL_GAP_Z
    } else {
      // Auto-fit: scale panels to fit TARGET_ACROSS along longer side
      const T = Math.max(1, Math.floor(TARGET_ACROSS))
      let s = acrossSpan / (T * baseAcross)
      if (!UPSCALE_PANELS) s = Math.min(1, s)
      s = Math.max(0.5, Math.min(10.0, s))
      scale = [
        Math.abs(BASE_PANEL_SCALE[0]) * s * panel.normalizationFactor, 
        BASE_PANEL_SCALE[1] * panel.normalizationFactor, 
        Math.abs(BASE_PANEL_SCALE[2]) * s * panel.normalizationFactor
      ]

      effX = panel.widthX * scale[0]
      effZ = panel.depthZ * scale[2]
      stepX = effX + PANEL_GAP_X
      stepZ = effZ + PANEL_GAP_Z

      if (longIsX) {
        cols = T
        rows = Math.max(1, Math.floor((depthAvailable + PANEL_GAP_Z) / stepZ))
      } else {
        rows = T
        cols = Math.max(1, Math.floor((widthAvailable + PANEL_GAP_X) / stepX))
      }
    }

    // Position grid centered within roof bounds
    const totalWidth = cols * effX + (cols - 1) * PANEL_GAP_X
    const totalDepth = rows * effZ + (rows - 1) * PANEL_GAP_Z
    gridStartX = Math.max(planeXMin, Math.min(clampedXMin + (widthAvailable - totalWidth) / 2, planeXMax - totalWidth))
    gridStartZ = Math.max(planeZMin, Math.min(clampedZMin + (depthAvailable - totalDepth) / 2, planeZMax - totalDepth))

    // Limit total panels to the number of overrides from API, or use calculated grid size
    const maxFromGrid = Math.min(MAX_PANELS, rows * cols)
    const maxFromAPI = overrides.length > 0 ? overrides.length : maxFromGrid
    const total = Math.min(maxFromGrid, maxFromAPI)

    const lift = PANEL_LIFT + (-panel.minY * Math.abs(scale[1]))
    const up = new Vector3(0, 1, 0)
    const positions: [number, number, number][] = []
    const orientations: Quaternion[] = []

    // Place panels on invisible plane
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (positions.length >= total) break

        const x = gridStartX + effX / 2 + (cols === 1 ? 0 : c * stepX)
        const z = gridStartZ + effZ / 2 + (rows === 1 ? 0 : r * stepZ)
        const panelHalfX = effX / 2
        const panelHalfZ = effZ / 2
        
        // Boundary check: ensure panel stays within roof
        const safetyMargin = 0.4
        if (x - panelHalfX < planeXMin + safetyMargin || x + panelHalfX > planeXMax - safetyMargin ||
            z - panelHalfZ < planeZMin + safetyMargin || z + panelHalfZ > planeZMax - safetyMargin) {
          continue
        }
        
        const p = new Vector3(x, planeTopY + lift, z)
        const normal = up.clone()
        const panelIndex = positions.length
        const ov = overrides.length ? overrides[panelIndex % overrides.length] : undefined

        // Calculate panel orientation from azimuth/slope overrides
        // Azimuth: 0°=North, 90°=East, 180°=South, 270°=West
        // Slope: 0°=horizontal, 90°=vertical
        let desiredNormal = normal.clone()
        let desiredHeading = new Vector3()
        
        if (ov) {
          const az = (ov.azimuth ?? 0) * DEG
          const sl = (ov.slope ?? 0) * DEG
          
          // For flat roof, use standard compass directions directly
          // North = -Z, East = +X in Three.js coordinate system
          const north = new Vector3(0, 0, -1)
          const east = new Vector3(1, 0, 0)
          
          // Calculate heading direction in horizontal plane (XZ)
          // heading = north * cos(azimuth) + east * sin(azimuth)
          const heading2D = new Vector3(
            Math.sin(az),  // East component
            0,
            -Math.cos(az)  // North component (negative Z = North)
          ).normalize()
          
          // Calculate panel normal: tilt from vertical (up) toward heading by slope angle
          // This creates the correct panel orientation
          desiredNormal = new Vector3(
            heading2D.x * Math.sin(sl),
            Math.cos(sl),  // Vertical component
            heading2D.z * Math.sin(sl)
          ).normalize()
          
          desiredHeading.copy(heading2D)
        } else {
          // Default: face North, no tilt
          desiredHeading.set(0, 0, -1)
        }

        // Build rotation quaternion from panel local axes to desired orientation
        const localNormal = panel.tAxis.clone().normalize()
        const localRight = panel.uAxis.clone().normalize()
        const localForward = new Vector3().crossVectors(localNormal, localRight).normalize()
        const forward = desiredHeading.clone().projectOnPlane(desiredNormal).normalize()
        
        if (forward.lengthSq() < 1e-12) {
          const fallback = Math.abs(desiredNormal.y) > 0.99 ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0)
          forward.copy(new Vector3().crossVectors(desiredNormal, fallback).normalize())
        }
        
        const right = new Vector3().crossVectors(forward, desiredNormal).normalize()
        const targetMatrix = new Matrix4().makeBasis(right, forward, desiredNormal)
        const localMatrix = new Matrix4().makeBasis(localRight, localForward, localNormal)
        const q = new Quaternion().setFromRotationMatrix(targetMatrix.clone().multiply(localMatrix.clone().invert()))

        positions.push([p.x, p.y, p.z])
        orientations.push(q)
      }
    }

    return { positions, orientations, scale }
  }, [house, panel, overrides])

  useEffect(() => {
    const isLoading = !house || !panel || data.positions.length === 0
    onLoadingChange?.(isLoading)
  }, [house, panel, data.positions.length, onLoadingChange])

  return (
    <group>
      <BuildingModel key={BUILDING_URL} ref={captureHouse} url={BUILDING_URL} />
      {house && data.positions.length > 0 && (
        <group rotation={[0, Math.PI / 2, 0]}>
          <SolarPanels
            url={PANEL_URL}
            positions={data.positions}
            orientations={data.orientations}
            defaultScale={data.scale}
          />
        </group>
      )}
    </group>
  )
}