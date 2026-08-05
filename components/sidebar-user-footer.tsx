"use client"

import { useUser } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"

import { useSidebar } from "@/components/ui/sidebar"

export function SidebarUserFooter() {
  const { user } = useUser()
  const { state } = useSidebar()

  if (state === "collapsed") {
    return (
      <div className="flex justify-center">
        <UserButton />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">
          {user?.fullName}
        </span>
      </div>
      <UserButton />
    </div>
  )
}
