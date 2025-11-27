import { describe, it, expect, vi, beforeEach } from "vitest"
import TestRenderer from "@react-three/test-renderer"
import { Object3D } from "three"

import BuildingModel from "../../ModelImportComponent/BuildingModel"

const mockUseGLTF = vi.fn()

vi.mock("@react-three/drei", () => ({
  useGLTF: (...args: any[]) => mockUseGLTF(...args)
}))

describe("BuildingModel", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders without crashing", async () => {
    mockUseGLTF.mockReturnValue({ scene: new Object3D() })

    const renderer = await TestRenderer.create(
      <BuildingModel url="/mock.gltf" />
    )

    expect(renderer).toBeDefined()
  })

  it("renders everything with GLTF scene", async () => {
  const scene = new Object3D()
  mockUseGLTF.mockReturnValue({ scene })

  const renderer = await TestRenderer.create(
    <BuildingModel url="/mock.gltf" />
  )

  const node = renderer.scene.allChildren.find(
    (child) => child.props?.object === scene
  )

  expect(node).toBeDefined()
})


  it("renders null when GLTF has no scene", async () => {
    mockUseGLTF.mockReturnValue({ scene: null })

    const renderer = await TestRenderer.create(
      <BuildingModel url="/mock.gltf" />
    )

    const primitive = renderer.scene.allChildren.find(
      (n) => n.type === "primitive"
    )

    expect(primitive).toBeUndefined()
  })

  it("forwards ref to the GLTF scene root", async () => {
    const scene = new Object3D()
    mockUseGLTF.mockReturnValue({ scene })

    let receivedRef: Object3D | null = null

    const TestComponent = () => {
      return (
        <BuildingModel
          url="/mock.gltf"
          ref={(obj) => {
            receivedRef = obj
          }}
        />
      )
    }

    await TestRenderer.create(<TestComponent />)

    expect(receivedRef).toBe(scene)
  })
})
