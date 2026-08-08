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

import type { WorkflowGraph } from "@/lib/db/schema"

const nodeTypes: NodeTypes = {
  step: StepNode,
}

const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function WorkflowCanvas({ graph }: { graph?: WorkflowGraph }) {
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)
  const colorMode = !mounted ? "dark" : resolvedTheme === "dark" ? "dark" : "light"

  const defaultNodes = graph && graph.nodes.length > 0 ? graph.nodes : initialNodes
  const defaultEdges = graph?.edges ?? initialEdges

  return (
    <div className="h-full">
      <ReactFlow
        nodeTypes={nodeTypes}
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
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
