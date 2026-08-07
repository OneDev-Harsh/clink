"use server"

import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {auth} from "@clerk/nextjs/server";
import {tasks} from "@trigger.dev/sdk";

import {createWorkflow, deleteWorkflow} from "@/features/workflows/data";
import type {helloWorldTask} from "@/trigger/example";

export async function createWorkflowAction(name: string) {
    const {orgId} = await auth();
    if (!orgId) throw new Error("No active organization");

    const [workflow] = await createWorkflow(orgId, name);

    revalidatePath("/workflows", "layout");
    redirect(`/workflows/${workflow.id}`);
}

export async function deleteWorkflowAction(workflowId: string) {
    const {orgId} = await auth();
    if (!orgId) throw new Error("No active organization");

    const [deleted] = await deleteWorkflow(orgId, workflowId);
    if (!deleted) throw new Error("Workflow not found");

    revalidatePath("/", "layout");
    redirect("/");
}

export async function runWorkflowAction() {
    const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
        message: "Hello from the Run button!",
    });

    return {runId: handle.id, publicAccessToken: handle.publicAccessToken};
}
