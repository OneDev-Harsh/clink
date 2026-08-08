import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"

import {
  nodeRegistry,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { useLatestRunSteps } from "@/features/workflows/components/workflow-runs-provider"

function StepNodeComponent({ id, data, selected }: NodeProps<StepNodeType>) {
  const { type, kind, title, values } = data
  const def = nodeRegistry[type]
  const Icon = def.icon
  const fields = def.fields.filter((field) => values[field.key])

  const { steps, isLive } = useLatestRunSteps()
  const step = steps?.find((s) => s.nodeId === id)
  const isRunning = isLive && step?.status === "running"
  const isFailed = step?.status === "failed"

  // A trigger starts the flow and takes no input, so it has no target handle.
  const hasTarget = kind !== "trigger"

  return (
    <div
      className={cn(
        "min-w-50 max-w-80 rounded-xl border bg-card shadow-sm transition-[border-color,box-shadow]",
        isRunning
          ? "border-blue-500 shadow-blue-500/15"
          : isFailed
            ? "border-destructive/60"
            : "border-border",
        selected &&
          "border-foreground/30 shadow-lg ring-2 ring-ring/40 ring-offset-2 ring-offset-background"
      )}
    >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ transform: "translate(-50%, -50%)" }}
          className="size-2.5! min-w-0! rounded-full! border-2! border-background! bg-border! transition-all hover:size-3.5! hover:bg-muted-foreground!"
        />
      )}

      <div className="flex items-center gap-2.5 px-3 py-3">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg shadow-sm",
            def.accent
          )}
        >
          {isRunning ? <Spinner /> : <Icon className="size-4" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm leading-tight font-semibold">
            {title}
          </span>
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {kind === "trigger" ? "Trigger" : "Action"}
          </span>
        </div>
      </div>

      {fields.length > 0 && (
        <>
          <div className="mx-3 border-t border-border/60" />
          <div className="flex flex-col gap-1.5 px-3 py-2.5">
            {fields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <span className="shrink-0 text-muted-foreground">
                  {field.label}
                </span>
                <span className="truncate font-medium text-foreground/90">
                  {values[field.key]}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{ transform: "translate(-50%, -50%)" }}
        className="size-2.5! min-w-0! rounded-full! border-2! border-background! bg-border! transition-all hover:size-3.5! hover:bg-muted-foreground!"
      />
    </div>
  )
}

export const StepNode = memo(StepNodeComponent)