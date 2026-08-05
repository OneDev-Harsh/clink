"use server"

import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {auth} from "@clerk/nextjs/server";

import {createWorkflow} from "@/features/workflows/data";

export async function createWorkflowAction(name: string) {
    const {orgId} = await auth();
    if (!orgId) throw new Error("No active organization");

    const [workflow] = await createWorkflow(orgId, name);

    revalidatePath("/workflows", "layout");
    redirect(`/workflows/${workflow.id}`);
}
