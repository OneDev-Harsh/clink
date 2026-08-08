import { ReactFlowProvider } from "@xyflow/react"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { auth as triggerAuth } from "@trigger.dev/sdk"

import { WorkflowRunsProvider } from "@/features/workflows/components/workflow-runs-provider"
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

  const publicAccessToken = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        tags: [`workflow:${id}`],
      },
    },
    expirationTime: "1hr",
  })

  return (
    <div className="flex h-full min-h-svh flex-col">
      <ReactFlowProvider>
        <WorkflowRunsProvider workflowId={id} publicAccessToken={publicAccessToken}>
          <WorkflowShell workflowId={id} graph={workflow.graph ?? undefined} />
        </WorkflowRunsProvider>
      </ReactFlowProvider>
    </div>
  )
}
