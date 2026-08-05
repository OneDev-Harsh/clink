"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

export function SidebarFloatingTrigger() {
  return (
    <SidebarTrigger
      variant="outline"
      className="absolute top-3 left-3 z-10 bg-background shadow-sm"
    />
  )
}
