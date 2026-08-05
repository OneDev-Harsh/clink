"use client"

import { OrganizationSwitcher } from "@clerk/nextjs"

import { useSidebar } from "@/components/ui/sidebar"

export function SidebarOrganizationSwitcher() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <OrganizationSwitcher
      appearance={
        collapsed
          ? {
              elements: {
                organizationSwitcherTrigger: {
                  justifyContent: "center",
                  width: "100%",
                },
                organizationPreviewTextContainer__organizationSwitcherTrigger: {
                  display: "none",
                },
                organizationSwitcherTriggerIcon: { display: "none" },
              },
            }
          : undefined
      }
    />
  )
}
