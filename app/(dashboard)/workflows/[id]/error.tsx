"use client"

import { useEffect } from "react"
import { TriangleAlertIcon } from "lucide-react"

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full min-h-svh flex-col">
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon className="size-12" />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyContent>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            {error.message}
          </EmptyDescription>
          <Button className="mt-2" onClick={unstable_retry}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
