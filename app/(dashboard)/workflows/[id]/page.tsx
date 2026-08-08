import { ReactFlowProvider } from "@xyflow/react"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { WorkflowShell } from "@/features/workflows/components/workflow-shell"
import { getWorkflow } from "@/features/workflows/data"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { orgId } = await auth()
  if (!orgId) notFound()

  const workflow = await getWorkflow(orgId, id)
  if (!workflow) notFound()

  return (
    <div className="flex h-full min-h-svh flex-col">
      <ReactFlowProvider>
        <WorkflowShell workflowId={id} graph={workflow.graph ?? undefined} />
      </ReactFlowProvider>
    </div>
  )
}
