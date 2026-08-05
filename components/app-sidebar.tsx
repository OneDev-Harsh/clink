"use client"

import { OrganizationSwitcher, UserButton, useUser } from "@clerk/nextjs"
import { WorkflowIcon, Plus } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const workflows = [
  { id: "1", name: "Onboarding" },
  { id: "2", name: "Invoice Approval" },
  { id: "3", name: "Customer Sync" },
  { id: "4", name: "Weekly Digest" },
  { id: "5", name: "Data Cleanup" },
]

export function AppSidebar() {
  const { user } = useUser()

  return (
    <Sidebar>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workflows</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflows.map((workflow) => (
                <SidebarMenuItem key={workflow.id}>
                  <SidebarMenuButton tooltip={workflow.name}>
                    <WorkflowIcon />
                    <span>{workflow.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="New Workflow">
                  <Plus />
                  <span>New Workflow</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">
              {user?.fullName}
            </span>
          </div>
          <UserButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
