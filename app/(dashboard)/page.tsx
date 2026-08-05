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
    <div className="flex h-full min-h-svh flex-col">
      <Empty className="flex-1">
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
