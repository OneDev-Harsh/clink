import { auth } from "@clerk/nextjs/server"

import { SidebarOrganizationSwitcher } from "@/components/sidebar-organization-switcher"
import { SidebarUserFooter } from "@/components/sidebar-user-footer"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { listWorkflows } from "@/features/workflows/data"
import { createWorkflowAction } from "@/features/workflows/components/lib/actions"
import { WorkflowNav } from "@/features/workflows/components/workflow-nav"

export async function AppSidebar() {
  const { orgId } = await auth()
  const workflows = orgId ? await listWorkflows(orgId) : []

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarOrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <WorkflowNav workflows={workflows} createWorkflow={createWorkflowAction} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserFooter />
      </SidebarFooter>
    </Sidebar>
  )
}
