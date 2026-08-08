import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { WorkflowIcon, Plus } from "lucide-react"

export default function Page() {
  return (
    <div className="relative flex h-full min-h-svh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_-10%,oklch(0.3_0.025_260/0.55),transparent)]"
      />
      <Empty className="relative flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WorkflowIcon className="size-12" />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>No workflow selected</EmptyTitle>
          <EmptyDescription>
            Select a workflow from the sidebar to view its details, or create a new
            workflow to get started.
          </EmptyDescription>
          <Button className="mt-2">
            <Plus />
            New Workflow
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
