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

  let inspectorSelection: InspectorSelection | undefined
  if (selected?.kind === "step") {
    const step = selectedRun?.steps.find((s) => s.nodeId === selected.nodeId)
    if (step) inspectorSelection = { kind: "step", step }
  } else if (selected?.kind === "replay" && selectedRun?.sessionId) {
    inspectorSelection = { kind: "replay", sessionId: selectedRun.sessionId }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 text-sm font-semibold">
        <Terminal className="size-4" />
        Console
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
