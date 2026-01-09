import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import TestRenderer from "@react-three/test-renderer"
import { Object3D, Vector3, Quaternion } from "three"
import BuildingWithSolarPanels from "../../ModelImportComponent/BuildingWithSolarPanels"

let panelPositionsMock: [number, number, number][] = []
let panelOrientationsMock: Quaternion[] = []
let panelScaleMock: [number, number, number] | null = null

vi.mock("@react-three/drei", () => ({
  useGLTF: vi.fn(() => {
    const mesh: any = new Object3D()
    mesh.isMesh = true

    const posArray = new Float32Array([
      -1, 0, -0.5,
       1, 0, -0.5,
       1, 0,  0.5,
      -1, 0,  0.5
    ])

    mesh.geometry = {
      boundingBox: {
        min: new Vector3(-1, 0, -0.5),
        max: new Vector3(1, 0, 0.5)
      },
      getAttribute: (name: string) => {
        if (name === "position")
          return {
            count: 4,
            getX: (i: number) => posArray[i * 3 + 0],
            getY: (i: number) => posArray[i * 3 + 1],
            getZ: (i: number) => posArray[i * 3 + 2]
          }
        if (name === "normal")
          return {
            count: 4,
            getX: () => 0,
            getY: () => 1,
            getZ: () => 0
          }
        return null
      }
    }

    const scene: any = new Object3D()
    scene.add(mesh)
    scene.traverse = (fn: any) => fn(mesh)
    return { scene }
  })
}))

function createMockRoof(): Object3D {
  const roof: any = new Object3D()
  roof.isMesh = true
  roof.name = "roof"

  const posArray = new Float32Array([
    -10, 10, -10,
     10, 10, -10,
     10, 10,  10,
    -10, 10,  10
  ])

  roof.geometry = {
    getAttribute: (name: string) => {
      if (name === "position")
        return {
          count: 4,
          getX: (i: number) => posArray[i * 3 + 0],
          getY: (i: number) => posArray[i * 3 + 1],
          getZ: (i: number) => posArray[i * 3 + 2]
        }
      if (name === "normal")
        return {
          count: 4,
          getX: () => 0,
          getY: () => 1,
          getZ: () => 0
        }
      return null
    },
    boundingBox: {
      min: new Vector3(-10, 10, -10),
      max: new Vector3(10, 10, 10)
    }
  }

  roof.updateMatrixWorld = () => {}
  roof.updateWorldMatrix = () => {}
  return roof
}

vi.mock("../../ModelImportComponent/BuildingModel", () => ({
  default: React.forwardRef((_props, ref) => {
    React.useEffect(() => {
      const house = new Object3D()
      const roof = createMockRoof()

      house.add(roof)
      house.traverse = (fn: any) => { fn(house); fn(roof) }

      if (typeof ref === "function") ref(house)
      else if (ref && typeof ref === "object") (ref as any).current = house
    }, [])
    return null
  })
}))

vi.mock("../../ModelImportComponent/SolarPanels", () => ({
  default: ({ positions, orientations, defaultScale }: any) => {
    panelPositionsMock= positions.map((p: any) => [...p])
    panelOrientationsMock = orientations
    panelScaleMock = defaultScale
    return null
  }
}))


describe("BuildingWithSolarPanels", () => {
  let renderer: Awaited<ReturnType<typeof TestRenderer.create>>

  beforeEach(async () => {
    panelPositionsMock= []
    panelOrientationsMock = []
    panelScaleMock = null
    vi.clearAllMocks()
    renderer = await TestRenderer.create(<BuildingWithSolarPanels />)
  })
  it("generates panels", () => {
    expect(panelPositionsMock
    .length).toBeGreaterThan(0)
  })
  it("generates orientations for all panels", () => {
    expect(panelOrientationsMock.length).toBe(panelPositionsMock.length)
  })
  it("panels are above the roof (y >= 10)", () => {
    panelPositionsMock.forEach(p => {
      expect(p[1]).toBeGreaterThanOrEqual(10)
    })
  })

  it("scale is applied", () => {
    expect(panelScaleMock).not.toBeNull()
  })

  it("does not exceed 50 panels", () => {
    expect(panelPositionsMock.length).toBeLessThanOrEqual(50)
  })
})

describe("BuildingWithSolarPanels - integration tests", () => {
  let renderer: Awaited<ReturnType<typeof TestRenderer.create>>

  beforeEach(async () => {
    panelPositionsMock = []
    panelOrientationsMock = []
    panelScaleMock = null
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("calls onLoadingChange(true → false)", async () => {
    const onLoadingChange = vi.fn()

    renderer = await TestRenderer.create(
      <BuildingWithSolarPanels onLoadingChange={onLoadingChange} />
    )

    expect(onLoadingChange).toHaveBeenCalledWith(true)
    expect(onLoadingChange).toHaveBeenLastCalledWith(false)
  })

  it("uses panel overrides from localStorage", async () => {
    localStorage.setItem(
      "resultData",
      JSON.stringify({
        output: {
          panels: {
            panel1: { azimuth: 0, slope: 30 },
            panel2: { azimuth: 90, slope: 20 }
          }
        }
      })
    )

    renderer = await TestRenderer.create(<BuildingWithSolarPanels />)

    expect(panelOrientationsMock.length).toBeGreaterThanOrEqual(2)

    panelOrientationsMock.forEach(q => {
      expect(
        Math.abs(q.x) + Math.abs(q.y) + Math.abs(q.z)
      ).toBeGreaterThan(0)
    })
  })

  it("limits number of panels to API override count", async () => {
    localStorage.setItem(
      "resultData",
      JSON.stringify({
        output: {
          panels: {
            p1: { azimuth: 0, slope: 10 },
            p2: { azimuth: 0, slope: 10 }
          }
        }
      })
    )

    renderer = await TestRenderer.create(<BuildingWithSolarPanels />)

    expect(panelPositionsMock.length).toBe(2)
  })

  it("recomputes panels when storage event is fired", async () => {
    renderer = await TestRenderer.create(<BuildingWithSolarPanels />)

    const initialCount = panelPositionsMock.length

    localStorage.setItem(
      "resultData",
      JSON.stringify({
        output: {
          panels: {
            p1: { azimuth: 45, slope: 15 }
          }
        }
      })
    )

    window.dispatchEvent(
      new StorageEvent("storage", { key: "resultData" })
    )

    await TestRenderer.act(async () => {})

    expect(panelPositionsMock.length).toBe(1)
    expect(panelPositionsMock.length).not.toBe(initialCount)
  })

  it("default orientation is north-facing when no overrides exist", async () => {
    renderer = await TestRenderer.create(<BuildingWithSolarPanels />)

    const q = panelOrientationsMock[0]
    const v = new Vector3(0, 1, 0).applyQuaternion(q)

    expect(v.y).toBeGreaterThan(0.5)
  })
})
