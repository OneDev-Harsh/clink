"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type {
  runWorkflowTask,
  RunStep,
} from "@/features/workflows/tasks/run-workflow"

type WorkflowRun = ReturnType<
  typeof useRealtimeRunsWithTag<typeof runWorkflowTask>
>["runs"][number]

export type WorkflowRunWithSteps = WorkflowRun & {
  steps: RunStep[]
}

const WorkflowRunsContext = createContext<WorkflowRun[]>([])

export function WorkflowRunsProvider({
  workflowId,
  publicAccessToken,
  children,
}: {
  workflowId: string
  publicAccessToken: string
  children: ReactNode
}) {
  const { runs } = useRealtimeRunsWithTag<typeof runWorkflowTask>(
    `workflow:${workflowId}`,
    {
      accessToken: publicAccessToken,
      skipColumns: ["payload"],
      enabled: !!workflowId && !!publicAccessToken,
    }
  )

  return (
    <WorkflowRunsContext.Provider value={runs}>
      {children}
    </WorkflowRunsContext.Provider>
  )
}

function resolveSteps(run: WorkflowRun): RunStep[] {
  return (
    run.output?.steps ??
    (run.metadata?.steps as RunStep[] | undefined) ??
    []
  )
}

export function useWorkflowRuns(): WorkflowRunWithSteps[] {
  const runs = useContext(WorkflowRunsContext)

  return useMemo(
    () => runs.map((run) => ({ ...run, steps: resolveSteps(run) })),
    [runs]
  )
}

export function useLatestRunSteps(): {
  steps: RunStep[] | undefined
  isLive: boolean
} {
  const runs = useContext(WorkflowRunsContext)
  const latest = runs[runs.length - 1]

  if (!latest) return { steps: undefined, isLive: false }

  const steps =
    latest.output?.steps ??
    (latest.metadata?.steps as RunStep[] | undefined)

  return { steps, isLive: latest.isQueued || latest.isExecuting }
}
