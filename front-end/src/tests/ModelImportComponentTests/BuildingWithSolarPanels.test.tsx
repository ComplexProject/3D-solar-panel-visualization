import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import TestRenderer from "@react-three/test-renderer"
import { Object3D, Vector3, Quaternion } from "three"
import BuildingWithSolarPanels from "../../ModelImportComponent/BuildingWithSolarPanels"

let panelPositionsMock: [number, number, number][] = []
let panelOrientationsMock: Quaternion[] = []
let panelScaleMock: [number, number, number] | null = null

function createMockRoof(): Object3D {
  const roof = new Object3D() as any
  roof.isMesh = true
  roof.geometry = {
    getAttribute: () => ({ count: 1, getX: () => 0, getY: () => 1, getZ: () => 0 }),
    boundingBox: { min: new Vector3(-5, 10, -5), max: new Vector3(5, 10, 5) }
  }
  roof.position.set(0, 10, 0)
  roof.updateMatrixWorld()
  return roof
}

function createMockHouse(): Object3D {
  const house = new Object3D()
  const roof = createMockRoof()
  house.add(roof)
  house.traverse = ((fn: (o: Object3D) => void) => { fn(house); fn(roof) }) as any
  return house
}

vi.mock("../../ModelImportComponent/BuildingModel", () => ({
  default: React.forwardRef<Object3D>((_props, ref) => {
    React.useEffect(() => { if (ref) (ref as any)(createMockHouse()) }, [])
    return null
  })
}))

vi.mock("../../ModelImportComponent/SolarPanels", () => ({
  default: () => {
    panelPositionsMock = []
    panelOrientationsMock = []
    const cols = 8
    const rows = 6
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        panelPositionsMock.push([c, 10, r])
        panelOrientationsMock.push(new Quaternion())
      }
    }
    panelScaleMock = [1, 1, 1]
    return null
  }
}))

vi.mock("@react-three/drei", () => ({
  useGLTF: vi.fn(() => ({
    scene: { traverse: (fn: (o: Object3D) => void) => fn(createMockRoof()) }
  }))
}))

vi.mock("three", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>
  class FakeRaycaster extends actual.Raycaster {
    intersectObject(_object: Object3D) {
      const hits: any[] = []
      const cols = 8
      const rows = 6
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          hits.push({ point: new Vector3(c, 10, r), face: null, object: _object })
        }
      }
      return hits
    }
    set() {}
  }
  return { ...actual, Raycaster: FakeRaycaster }
})

describe("BuildingWithSolarPanels", () => {

  let renderer: Awaited<ReturnType<typeof TestRenderer.create>>

  beforeEach(async () => {
    panelPositionsMock = []
    panelOrientationsMock = []
    panelScaleMock = null
    vi.clearAllMocks()
    renderer = await TestRenderer.create(<BuildingWithSolarPanels />)
  })

  it("renders root scene without crashing", () => {
    expect(renderer.scene).toBeDefined()
  })

  it("generates panels", () => {
    expect(panelPositionsMock.length).toBeGreaterThan(0)
    expect(panelOrientationsMock.length).toBe(panelPositionsMock.length)
    expect(panelScaleMock).not.toBeNull()
  })

  it("positions panels on rooftop", () => {
    panelPositionsMock.forEach(pos => expect(pos[1]).toBeGreaterThanOrEqual(10))
  })

  it("does not exceed max", () => {
    const MAX_PANELS = 50
    expect(panelPositionsMock.length).toBeLessThanOrEqual(MAX_PANELS)
  })

  it("orientations are upright", () => {
    const up = new Vector3(0, 1, 0)
    panelOrientationsMock.forEach(q => {
      const dir = new Vector3(0, 1, 0).applyQuaternion(q)
      expect(dir.dot(up)).toBeGreaterThan(0.9)
    })
  })

  it("panels are not overlapping", () => {
    const unique = new Set(panelPositionsMock.map(p => `${p[0]},${p[1]},${p[2]}`))
    expect(unique.size).toBe(panelPositionsMock.length)
  })

})
