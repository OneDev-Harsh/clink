"use client"

import { useCallback, useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
  Background,
  ConnectionLineType,
  Controls,
  Edge,
  MiniMap,
  NodeTypes,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type ColorMode,
  type Connection,
} from "@xyflow/react"

import {StepNode} from "@/features/workflows/components/step-node"
import { type StepNodeType } from "@/features/workflows/nodes/node-registry"

const nodeTypes: NodeTypes = { 
  step: StepNode,
}

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: {
      type: "start",
      kind: "trigger",
      title: "Start",
      values: {},
    },
  },
]

const initialEdges: Edge[] = []

const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function WorkflowCanvas() {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)
  const colorMode = !mounted ? "dark" : resolvedTheme === "dark" ? "dark" : "light"
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  return (
    <div className="h-full">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode={colorMode as ColorMode}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{stroke: "var(--border)"}}
        defaultEdgeOptions={{ type: "smoothstep", style: { stroke: "var(--border)" } }}
        style={
          {
            "--xy-background-color": "var(--background)",
            "--xy-edge-stroke-width": 2,
            "--xy-connection-line-stroke-width": 2,
          } as React.CSSProperties
        }
        maxZoom={1}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
