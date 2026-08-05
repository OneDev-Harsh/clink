import { FileQuestionIcon } from "lucide-react"

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-full min-h-svh flex-col">
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestionIcon className="size-12" />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>Workflow not found</EmptyTitle>
          <EmptyDescription>
            The workflow you are looking for does not exist or may have been
            removed.
          </EmptyDescription>
          <Button className="mt-2" asChild>
            <a href="/">Back to dashboard</a>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
