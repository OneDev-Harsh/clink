import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";

import {type Edge} from "@xyflow/react"
import {type StepNodeType} from "@/features/workflows/nodes/node-registry"

export type WorkflowGraph = {
  nodes: StepNodeType[]
  edges: Edge[]
}

export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  graph: jsonb("graph").$type<WorkflowGraph>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Workflow  = typeof workflows.$inferSelect

// Tracks the browser session of a workflow run so the replay endpoint can
// verify ownership before streaming a recording.
export const workflowRuns = pgTable("workflow_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").notNull(),
  orgId: text("org_id").notNull(),
  sessionId: text("session_id").notNull().unique(),
  status: text("status").notNull().default("running"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type WorkflowRunRow = typeof workflowRuns.$inferSelect