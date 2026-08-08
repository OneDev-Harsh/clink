"use client"

import { useState } from "react"
import { Terminal } from "lucide-react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { useWorkflowRuns } from "@/features/workflows/components/workflow-runs-provider"

import { InspectorPanel } from "./inspector-panel"
import { LogsPanel, type StepSelection } from "./logs-panel"

// The console below the canvas: a header, the runs list, and — while a step is
// selected — its result next to the logs. Owns the currently selected step —
// clicking a step toggles it.
export function ConsolePanel() {
  const runs = useWorkflowRuns()
  const [selected, setSelected] = useState<StepSelection | undefined>()

  const toggleStep = (runId: string, nodeId: string) => {
    setSelected((prev) =>
      prev && prev.runId === runId && prev.nodeId === nodeId
        ? undefined
        : { runId, nodeId }
    )
  }

  const selectedStep = selected
    ? runs
        .find((run) => run.id === selected.runId)
        ?.steps.find((step) => step.nodeId === selected.nodeId)
    : undefined

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 text-sm font-semibold">
        <Terminal className="size-4" />
        Console
      </div>
      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel minSize="10rem">
          <div className="h-full overflow-y-auto">
            <LogsPanel selected={selected} onToggleStep={toggleStep} />
          </div>
        </ResizablePanel>
        {selectedStep && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="20rem" minSize="12rem" maxSize="32rem">
              <InspectorPanel step={selectedStep} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
