"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  ReactFlow,
  type ColorMode,
  type NodeTypes,
} from "@xyflow/react"

import { StepNode } from "@/features/workflows/components/step-node"
import {
  initialEdges,
  initialNodes,
} from "@/features/workflows/lib/initial-flow"

const nodeTypes: NodeTypes = {
  step: StepNode,
}

const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function WorkflowCanvas() {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)
  const colorMode = !mounted ? "dark" : resolvedTheme === "dark" ? "dark" : "light"

  return (
    <div className="h-full">
      <ReactFlow
        nodeTypes={nodeTypes}
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        fitView
        colorMode={colorMode as ColorMode}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "var(--border)" }}
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
