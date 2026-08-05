import { WorkflowShell } from "@/features/workflows/components/workflow-shell"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex h-full min-h-svh flex-col">
      <WorkflowShell workflowId={id} />
    </div>
  )
}
