"use client"

import { useState } from "react"
import { Terminal } from "lucide-react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { useWorkflowRuns } from "@/features/workflows/components/workflow-runs-provider"

import { InspectorPanel, type InspectorSelection } from "./inspector-panel"
import { LogsPanel, type RunSelection } from "./logs-panel"

function sameSelection(a: RunSelection, b: RunSelection): boolean {
  if (a.runId !== b.runId) return false
  if (a.kind === "replay" || b.kind === "replay") {
    return a.kind === "replay" && b.kind === "replay"
  }
  return a.nodeId === b.nodeId
}

// The console below the canvas: a header, the runs list, and — while a step or
// replay is selected — its result next to the logs. Owns the currently selected
// step — clicking a step toggles it.
export function ConsolePanel() {
  const runs = useWorkflowRuns()
  const [selected, setSelected] = useState<RunSelection | undefined>()

  const toggleSelection = (selection: RunSelection) => {
    setSelected((prev) =>
      prev && sameSelection(prev, selection) ? undefined : selection
    )
  }

  const selectedRun = selected
    ? runs.find((run) => run.id === selected.runId)
    : undefined

  const isLive = runs.some((run) => run.isExecuting || run.isQueued)

  let inspectorSelection: InspectorSelection | undefined
  if (selected?.kind === "step") {
    const step = selectedRun?.steps.find((s) => s.nodeId === selected.nodeId)
    if (step) inspectorSelection = { kind: "step", step }
  } else if (selected?.kind === "replay" && selectedRun?.sessionId) {
    inspectorSelection = { kind: "replay", sessionId: selectedRun.sessionId }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-1.5">
        <div className="flex size-5 items-center justify-center rounded-md bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-sm">
          <Terminal className="size-3" />
        </div>
        <span className="text-sm font-semibold">Console</span>
        <div className="ml-auto flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-blue-500" />
              </span>
              Live
            </span>
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            {runs.length} {runs.length === 1 ? "run" : "runs"}
          </span>
        </div>
      </div>
      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel minSize="10rem">
          <div className="h-full overflow-y-auto">
            <LogsPanel selected={selected} onToggle={toggleSelection} />
          </div>
        </ResizablePanel>
        {inspectorSelection && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="20rem" minSize="12rem" maxSize="32rem">
              <InspectorPanel selection={inspectorSelection} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
