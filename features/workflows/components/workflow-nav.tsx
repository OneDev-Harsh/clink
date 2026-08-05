"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, WorkflowIcon } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { Workflow } from "@/lib/db/schema"
import { generateSlug } from "@/features/workflows/components/lib/generate-slug"

function WorkflowNavItem({
  workflow,
  tooltip,
}: {
  workflow: Workflow
  tooltip?: string
}) {
  const pathname = usePathname()
  const isActive = pathname === `/workflows/${workflow.id}`

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={tooltip}>
        <Link href={`/workflows/${workflow.id}`}>
          <span>{workflow.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function WorkflowNav({
  workflows,
  createWorkflow,
}: {
  workflows: Workflow[]
  createWorkflow: (name: string) => Promise<void>
}) {
  const { state } = useSidebar()

  const handleCreate = async () => {
    await createWorkflow(generateSlug())
  }

  if (state === "expanded") {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Workflows</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {workflows.map((workflow) => (
              <WorkflowNavItem
                key={workflow.id}
                workflow={workflow}
                tooltip={workflow.name}
              />
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                variant="outline"
                tooltip="New Workflow"
                onClick={handleCreate}
              >
                <Plus />
                <span>New Workflow</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Popover>
              <PopoverTrigger asChild>
                <SidebarMenuButton>
                  <WorkflowIcon />
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent side="right" align="start">
                <SidebarMenu>
                  {workflows.map((workflow) => (
                    <WorkflowNavItem
                      key={workflow.id}
                      workflow={workflow}
                    />
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      variant="outline"
                      onClick={handleCreate}
                    >
                      <Plus />
                      <span>New Workflow</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
