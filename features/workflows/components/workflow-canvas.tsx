"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
  Background,
  BackgroundVariant,
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

// Accent color per node type, used to color minimap nodes.
const minimapColors: Record<string, string> = {
  start: "#3b82f6",
  "open-url": "#10b981",
  act: "#8b5cf6",
  extract: "#f59e0b",
  observe: "#06b6d4",
  agent: "#f43f5e",
  "send-email": "#f97316",
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
    <div className="relative h-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_-10%,oklch(0.3_0.025_260/0.55),transparent)]"
      />
      <ReactFlow
        nodeTypes={nodeTypes}
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        fitView
        colorMode={colorMode as ColorMode}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "var(--muted-foreground)" }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "color-mix(in oklab, var(--foreground) 16%, transparent)" },
        }}
        style={
          {
            "--xy-background-color": "var(--background)",
            "--xy-edge-stroke-width": 2,
            "--xy-edge-stroke-selected": "var(--ring)",
            "--xy-connection-line-stroke-width": 2,
          } as React.CSSProperties
        }
        maxZoom={1}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.25}
          color="color-mix(in oklab, var(--foreground) 12%, transparent)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) =>
            minimapColors[(node.data as { type?: string } | undefined)?.type ?? ""] ??
            "var(--muted-foreground)"
          }
          maskColor="color-mix(in oklab, var(--background) 78%, transparent)"
        />
      </ReactFlow>
    </div>
  )
}
