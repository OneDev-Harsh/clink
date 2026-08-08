import toposort from "toposort"
import {logger, metadata, task} from "@trigger.dev/sdk"

import { Stagehand } from "@browserbasehq/stagehand"
import {nodeExecutors} from "@/features/workflows/nodes/node-executors"
import {interpolate} from "@/features/workflows/lib/interpolate"
import type {NodeType, StepNodeType} from "@/features/workflows/nodes/node-registry"
import type {DeserializedJson} from "@trigger.dev/core"

import {getWorkflow, recordWorkflowSession} from "@/features/workflows/data"

export type RunStepStatus = "pending" | "running" | "done" | "failed"

export type RunStep = {
    nodeId: string
    nodeType: NodeType
    title: string
    status: RunStepStatus
    durationMs?: number
    output?: DeserializedJson
    error?: {
        name: string
        message: string
    }
}

const PLACEHOLDER_PATTERN = /\{\{\s*([^{}\s]+)\s*\}\}/g

// Logs a warning for placeholders that reference an unknown node or a node
// that hasn't produced an output yet, instead of silently resolving to "".
function warnOnMissingReferences(
    rawValues: Record<string, string>,
    title: string,
    outputs: Record<string, unknown>,
    nodeById: Map<string, StepNodeType>,
) {
    for(const [field, text] of Object.entries(rawValues)){
        PLACEHOLDER_PATTERN.lastIndex = 0
        let match: RegExpExecArray | null
        while((match = PLACEHOLDER_PATTERN.exec(text))){
            const expression = match[1]
            const dotIndex = expression.indexOf(".")
            const nodeId = dotIndex === -1 ? expression : expression.slice(0, dotIndex)

            if(!nodeById.has(nodeId)){
                logger.warn(`Node "${title}" field "${field}" references unknown node "${nodeId}"`)
                continue
            }
            if(!(nodeId in outputs)){
                logger.warn(`Node "${title}" field "${field}" references node "${nodeId}" which has not produced an output yet`)
            }
        }
    }
}

function toRunError(error: unknown): {name: string; message: string} {
    if(error instanceof Error) return {name: error.name, message: error.message}
    return {name: "Error", message: String(error)}
}

export const runWorkflowTask = task({
    id: "run-workflow",
    run: async ({workflowId, orgId} : {workflowId: string, orgId: string}) => {
        const workflow = await getWorkflow(orgId, workflowId)
        if(!workflow) throw new Error(`Workflow ${workflowId} not found for org ${orgId}`)
        if(!workflow.graph) throw new Error(`Workflow ${workflowId} has no graph defined`)

        const {nodes, edges} = workflow.graph
        const byId = new Map(nodes.map(node => [node.id, node])) 

        const connected = new Set(edges.flatMap(edge => [edge.source, edge.target]))
        const order = toposort.array(nodes.map(node => node.id), edges.map(edge => [edge.source, edge.target])).filter(id => connected.has(id))

        logger.log(`Running workflow ${workflowId} for org ${orgId} with ${nodes.length} nodes and ${edges.length} edges in order: ${order.join(", ")}`)

        const steps: RunStep[] = order.map(nodeId => {
            const node = byId.get(nodeId)!
            return {
                nodeId,
                nodeType: node.data.type,
                title: node.data.title,
                status: "pending" as const,
            }
        })
        const stepById = new Map(steps.map(step => [step.nodeId, step]))
        const publishSteps = () => {
            metadata.set("steps", steps)
        }
        publishSteps()

        const outputs: Record<string, unknown> = {}

        let stagehand: Stagehand | undefined
        let sessionId: string | undefined
        const getStagehand = async () => {
            if(stagehand) return stagehand
            stagehand = new Stagehand({
                env: "BROWSERBASE",
                apiKey: process.env.BROWSERBASE_API_KEY || "",
                model: "google/gemini-2.5-flash",
                disablePino: true,
            })
            await stagehand.init()
            sessionId = stagehand.browserbaseSessionID
            if(sessionId){
                await recordWorkflowSession({sessionId, workflowId, orgId, status: "running"})
            }
            return stagehand
        }

        let failed = false
        try {
            for(const id of order){
                const node = byId.get(id)
                logger.log(`Running node ${node?.data.title} (${node?.id}) of type ${node?.data.kind}`)

                const step = stepById.get(id)!
                step.status = "running"
                const startedAt = Date.now()
                publishSteps()
                await metadata.flush()

                const executor = nodeExecutors[node!.data.type]
                if(executor){
                    const rawValues = node!.data.values
                    warnOnMissingReferences(rawValues, node!.data.title, outputs, byId)
                    const values = Object.fromEntries(
                        Object.entries(rawValues).map(([key, value]) => [key, interpolate(value, outputs)])
                    )
                    try {
                        const result = await executor({values, getStagehand})
                        if(result !== undefined){
                            step.output = result as DeserializedJson
                            outputs[id] = result
                        }
                    } catch(error){
                        step.status = "failed"
                        step.durationMs = Date.now() - startedAt
                        step.error = toRunError(error)
                        publishSteps()
                        await metadata.flush()
                        throw error
                    }
                }

                step.status = "done"
                step.durationMs = Date.now() - startedAt
                publishSteps()
            }
        } catch (error) {
            failed = true
            throw error
        } finally {
            try {
                await stagehand?.close()
            } catch (error) {
                logger.warn(`Failed to close browser session: ${error instanceof Error ? error.message : String(error)}`)
            }
            if(sessionId){
                try {
                    await recordWorkflowSession({sessionId, workflowId, orgId, status: failed ? "failed" : "completed"})
                } catch (error) {
                    logger.warn(`Failed to record workflow session: ${error instanceof Error ? error.message : String(error)}`)
                }
            }
        }

        return {steps, sessionId}
    },
})
