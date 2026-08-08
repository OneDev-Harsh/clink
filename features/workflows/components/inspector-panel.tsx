"use client"

import { MonitorPlay } from "lucide-react"

import { NodeIcon } from "@/features/workflows/components/node-icon"
import { SessionReplay } from "@/features/workflows/components/session-replay"
import type { RunStep } from "@/features/workflows/tasks/run-workflow"

export type InspectorSelection =
  | { kind: "step"; step: RunStep }
  | { kind: "replay"; sessionId: string }

// The step's result: its error when it failed, its output as pretty JSON,
// or a short note when it has neither.
function StepResult({ step }: { step: RunStep }) {
  if (step.error) {
    return (
      <div className="flex flex-col gap-1 p-3">
        <p className="text-xs font-semibold text-destructive">
          {step.error.name}
        </p>
        <p className="text-xs leading-relaxed whitespace-pre-wrap text-destructive/80">
          {step.error.message}
        </p>
      </div>
    )
  }

  if (step.output !== undefined) {
    return (
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
        {JSON.stringify(step.output, null, 2)}
      </pre>
    )
  }

  return (
    <p className="p-3 text-sm text-muted-foreground">
      {step.status === "running" ? "Running…" : "No output"}
    </p>
  )
}

// The selected run's browser-session replay.
function ReplayPanel({ sessionId }: { sessionId: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 text-sm font-semibold">
        <MonitorPlay className="size-4" />
        <span className="min-w-0 truncate">Replay</span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <SessionReplay sessionId={sessionId} />
      </div>
    </div>
  )
}

// Shows the selected step's result or session replay next to the runs list.
export function InspectorPanel({ selection }: { selection: InspectorSelection }) {
  if (selection.kind === "replay") {
    return <ReplayPanel sessionId={selection.sessionId} />
  }

  const step = selection.step
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 text-sm font-semibold">
        <NodeIcon type={step.nodeType} className="size-4" />
        <span className="min-w-0 truncate">{step.title}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <StepResult step={step} />
      </div>
    </div>
  )
}
