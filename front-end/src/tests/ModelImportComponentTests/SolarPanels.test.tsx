import { describe, it, expect, vi, beforeEach } from "vitest"
import TestRenderer from "@react-three/test-renderer"
import { Object3D, Quaternion } from "three"
import { Mesh, BufferGeometry, Material } from "three"
import SolarPanels from "../../ModelImportComponent/SolarPanels"

const mockUseGLTF = vi.fn()

vi.mock("@react-three/drei", () => ({
  useGLTF: (...args: any[]) => mockUseGLTF(...args)
}))

function collectMeshesFromWrapper(node: any): Mesh[] {
  const meshes: Mesh[] = []

  if (node.instance && (node.instance as any).isMesh) {
    meshes.push(node.instance as Mesh)
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child: any) => {
      meshes.push(...collectMeshesFromWrapper(child))
    })
  }

  return meshes
}

function createMockMesh(name?: string) {
  const mesh = new Mesh(new BufferGeometry(), new Material())
  mesh.name = name ?? "default"
  return mesh
}

function createMockSceneWithMesh(name?: string) {
  const mesh = createMockMesh(name)
  const scene = new Object3D() as any
  scene.getObjectByName = (n: string) => (n === mesh.name ? mesh : undefined)
  scene.traverse = (fn: any) => fn(mesh)
  return { scene, mesh }
}

describe("SolarPanels", () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls useGLTF with the given URL", async () => {
    const { scene } = createMockSceneWithMesh()
    mockUseGLTF.mockReturnValue({ scene })

    await TestRenderer.create(<SolarPanels url="/panel.glb" positions={[]} />)
    expect(mockUseGLTF).toHaveBeenCalledWith("/panel.glb")
  })

  it("returns null when gltf.scene is missing", async () => {
    mockUseGLTF.mockReturnValue({ scene: null })

    const renderer = await TestRenderer.create(
      <SolarPanels url="/x" positions={[[1, 2, 3]]} />
    )
    const meshes = renderer.scene.allChildren.filter(n => n.type === "mesh")
    expect(meshes.length).toBe(0)
  })

  it("returns null when positions array is empty", async () => {
    const { scene } = createMockSceneWithMesh()
    mockUseGLTF.mockReturnValue({ scene })

    const renderer = await TestRenderer.create(
      <SolarPanels url="/x" positions={[]} />
    )
    const meshes = renderer.scene.allChildren.filter(n => n.type === "mesh")
    expect(meshes.length).toBe(0)
  })

  it("renders solar panel meshes at specified positions", async () => {
  const { scene, mesh } = createMockSceneWithMesh("SolarPanel")
  mockUseGLTF.mockReturnValue({ scene })

  const positions: [number, number, number][] = [
    [0, 0, 0],
    [1, 2, 3],
    [-1, -2, -3]
  ]

  const renderer = await TestRenderer.create(
    <SolarPanels url="/x" positions={positions} />
  )

  const meshes = collectMeshesFromWrapper(renderer.scene)

  expect(meshes.length).toBe(positions.length)

  positions.forEach((pos, index) => {
    const meshInstance = meshes[index]
    expect(meshInstance.position.x).toBe(pos[0])
    expect(meshInstance.position.y).toBe(pos[1])
    expect(meshInstance.position.z).toBe(pos[2])
    expect(meshInstance.geometry).toBe(mesh.geometry)
    expect(meshInstance.material).toBe(mesh.material)
  })
})
})

describe("SolarPanels – integration tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("applies defaultScale correctly to all panels", async () => {
    const { scene, mesh } = createMockSceneWithMesh("panelMesh")
    mockUseGLTF.mockReturnValue({ scene })

    const positions: [number, number, number][] = [
      [0, 0, 0],
      [1, 1, 1]
    ]

    const defaultScale: [number, number, number] = [2, 2, 2]

    const renderer = await TestRenderer.create(
      <SolarPanels url="/panel.glb" positions={positions} defaultScale={defaultScale} />
    )

    const meshes = collectMeshesFromWrapper(renderer.scene)
    meshes.forEach(m => {
      expect(m.scale.x).toBe(defaultScale[0])
      expect(m.scale.y).toBe(defaultScale[1])
      expect(m.scale.z).toBe(defaultScale[2])
    })
  })

  it("renders nothing when positions array is empty", async () => {
    const { scene } = createMockSceneWithMesh("panelMesh")
    mockUseGLTF.mockReturnValue({ scene })

    const renderer = await TestRenderer.create(
      <SolarPanels url="/panel.glb" positions={[]} />
    )

    const meshes = collectMeshesFromWrapper(renderer.scene)
    expect(meshes.length).toBe(0)
  })
})
