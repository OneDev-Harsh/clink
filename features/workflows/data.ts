import {and, desc, eq} from "drizzle-orm";

import {db} from "@/lib/db";
import {workflows} from "@/lib/db/schema"

export function listWorkflows(orgId: string) {
    return db.select().from(workflows).where(eq(workflows.orgId, orgId)).orderBy(desc(workflows.createdAt));
}

export function createWorkflow(orgId: string, name: string) {
    return db.insert(workflows).values({orgId, name}).returning();
}

export function deleteWorkflow(orgId: string, workflowId: string) {
    return db.delete(workflows).where(and(eq(workflows.id, workflowId), eq(workflows.orgId, orgId))).returning();
}