"use client"

import prettyMs from "pretty-ms"
import { format } from "date-fns"
import { MonitorPlay } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

import { NodeIcon } from "@/features/workflows/components/node-icon"
import {
  useWorkflowRuns,
  type WorkflowRunWithSteps,
} from "@/features/workflows/components/workflow-runs-provider"
import type { RunStep } from "@/features/workflows/tasks/run-workflow"

export type StepSelection = {
  runId: string
  kind: "step"
  nodeId: string
}

export type ReplaySelection = {
  runId: string
  kind: "replay"
}

export type RunSelection = StepSelection | ReplaySelection

// The status cue for a whole run: spins while it's executing, otherwise a dot.
function RunStatus({ run }: { run: WorkflowRunWithSteps }) {
  if (run.isExecuting || run.isQueued) {
    return <Spinner className="size-3 shrink-0 text-blue-500" />
  }

  return (
    <span
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        run.isFailed
          ? "bg-destructive"
          : run.isCompleted
            ? "bg-emerald-500"
            : "bg-muted-foreground/50"
      )}
    />
  )
}

// A single step row: node icon, title, and the time it took.
function StepItem({
  runId,
  step,
  isSelected,
  onToggle,
}: {
  runId: string
  step: RunStep
  isSelected: boolean
  onToggle: (selection: RunSelection) => void
}) {
  const isRunning = step.status === "running"
  const isFailed = step.status === "failed"
  const isPending = step.status === "pending"

  return (
    <button
      type="button"
      onClick={() => onToggle({ runId, kind: "step", nodeId: step.nodeId })}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors",
        isSelected && "bg-muted"
      )}
    >
      <NodeIcon
        type={step.nodeType}
        running={isRunning}
        className={cn(
          "size-4",
          isFailed && "bg-destructive/15 text-destructive",
          isPending && "opacity-40 saturate-0"
        )}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-medium",
          isFailed && "text-destructive"
        )}
      >
        {step.title}
      </span>
      {!isPending && !isRunning && step.durationMs !== undefined && (
        <span className="shrink-0 text-muted-foreground tabular-nums">
          {prettyMs(step.durationMs)}
        </span>
      )}
    </button>
  )
}

// A whole-run replay row: plays back the session recording when selected.
function ReplayItem({
  runId,
  isSelected,
  onToggle,
}: {
  runId: string
  isSelected: boolean
  onToggle: (selection: RunSelection) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle({ runId, kind: "replay" })}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors",
        isSelected && "bg-muted"
      )}
    >
      <MonitorPlay className="size-4 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate font-medium">Replay</span>
    </button>
  )
}

// A run's header plus its steps, newest runs first.
function RunItem({
  run,
  selected,
  onToggle,
}: {
  run: WorkflowRunWithSteps
  selected?: RunSelection
  onToggle: (selection: RunSelection) => void
}) {
  const hasReplay =
    run.sessionId !== undefined && !run.isExecuting && !run.isQueued

  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
        <RunStatus run={run} />
        <span className="min-w-0 truncate font-medium tabular-nums">
          {format(run.createdAt, "MMM d, yyyy, h:mm a")}
        </span>
        {!run.isExecuting && !run.isQueued && run.durationMs > 0 && (
          <span className="ml-auto shrink-0 tabular-nums">
            {prettyMs(run.durationMs)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-1.5 pb-2">
        {run.steps.map((step) => (
          <StepItem
            key={step.nodeId}
            runId={run.id}
            step={step}
            isSelected={
              selected?.kind === "step" &&
              selected.runId === run.id &&
              selected.nodeId === step.nodeId
            }
            onToggle={onToggle}
          />
        ))}
        {hasReplay && (
          <ReplayItem
            runId={run.id}
            isSelected={
              selected?.kind === "replay" && selected.runId === run.id
            }
            onToggle={onToggle}
          />
        )}
      </div>
    </div>
  )
}

// The runs list: every workflow run with its steps nested underneath.
export function LogsPanel({
  selected,
  onToggle,
}: {
  selected?: RunSelection
  onToggle: (selection: RunSelection) => void
}) {
  const runs = useWorkflowRuns()

  if (runs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No runs yet
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {[...runs].reverse().map((run) => (
        <RunItem
          key={run.id}
          run={run}
          selected={selected}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
