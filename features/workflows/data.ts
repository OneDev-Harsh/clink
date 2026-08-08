import {and, desc, eq} from "drizzle-orm";

import {db} from "@/lib/db";
import {workflows, workflowRuns, WorkflowGraph} from "@/lib/db/schema"

import {validateGraph} from "@/features/workflows/lib/validate-graph"

export async function saveWorkflowGraph({
    orgId,
    id,
    graph,
    validate = true,
}: {
    orgId: string
    id: string
    graph: WorkflowGraph
    validate?: boolean
}) {
    if(validate){
        const problems = validateGraph(graph)
        if(problems.length > 0) throw new Error(`Workflow graph is invalid: ${problems.join(", ")}`)
    }

    await db.update(workflows).set({graph, updatedAt: new Date()}).where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)));
}

export async function getWorkflow(orgId: string, id: string) {
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))

  return workflow
}

export function listWorkflows(orgId: string) {
    return db.select().from(workflows).where(eq(workflows.orgId, orgId)).orderBy(desc(workflows.createdAt));
}

export function createWorkflow(orgId: string, name: string) {
    return db.insert(workflows).values({orgId, name}).returning();
}

export function deleteWorkflow(orgId: string, workflowId: string) {
    return db.delete(workflows).where(and(eq(workflows.id, workflowId), eq(workflows.orgId, orgId))).returning();
}

// Upserts the browser session for a run so the replay endpoint can authorize it.
export async function recordWorkflowSession({
    sessionId,
    workflowId,
    orgId,
    status,
}: {
    sessionId: string
    workflowId: string
    orgId: string
    status: "running" | "completed" | "failed"
}) {
    await db
        .insert(workflowRuns)
        .values({sessionId, workflowId, orgId, status, updatedAt: new Date()})
        .onConflictDoUpdate({
            target: workflowRuns.sessionId,
            set: {status, updatedAt: new Date()},
        });
}

// Looks up a run by session id, scoped to an org. Returns undefined when the
// session doesn't exist or belongs to another org.
export function getWorkflowRunBySessionId(sessionId: string, orgId: string) {
    return db
        .select()
        .from(workflowRuns)
        .where(and(eq(workflowRuns.sessionId, sessionId), eq(workflowRuns.orgId, orgId)))
        .limit(1);
}