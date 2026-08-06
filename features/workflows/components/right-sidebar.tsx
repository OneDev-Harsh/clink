"use client"

import { useState, useTransition } from "react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { Loader2, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { runWorkflowAction } from "@/features/workflows/lib/actions"
import type { helloWorldTask } from "@/trigger/example"

function RunStatus({
  runId,
  publicAccessToken,
}: {
  runId: string
  publicAccessToken: string
}) {
  const { run, error } = useRealtimeRun<typeof helloWorldTask>(
    runId,
    {
      accessToken: publicAccessToken,
      skipColumns: ["payload"],
    },
  )

  if (error) return <span className="text-destructive">Error: {error.message}</span>
  if (!run) return <span>Loading…</span>

  const progress = run.metadata?.progress as number | undefined

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="font-mono text-xs text-muted-foreground">{run.id}</span>
      <span>{run.status}</span>
      {typeof progress === "number" && (
        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {run.output && <span className="font-mono text-xs">Output: {JSON.stringify(run.output)}</span>}
    </div>
  )
}

export function RightSidebar() {
  const [isPending, startTransition] = useTransition()
  const [run, setRun] = useState<{ runId: string; publicAccessToken: string } | null>(null)

  const handleRun = () => {
    startTransition(async () => {
      const result = await runWorkflowAction()
      setRun(result)
    })
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">Inspector</span>
        <Button size="sm" onClick={handleRun} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Play />}
          Run
        </Button>
      </header>
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        {run ? (
          <RunStatus runId={run.runId} publicAccessToken={run.publicAccessToken} />
        ) : (
          <span>No selection</span>
        )}
      </div>
    </div>
  )
}
