"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type {
  runWorkflowTask,
  RunStep,
} from "@/features/workflows/tasks/run-workflow"

type WorkflowRun = ReturnType<
  typeof useRealtimeRunsWithTag<typeof runWorkflowTask>
>["runs"][number]

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
