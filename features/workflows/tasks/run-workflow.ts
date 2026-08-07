import toposort from "toposort"
import {logger, task} from "@trigger.dev/sdk"

import { Stagehand } from "@browserbasehq/stagehand"
import {nodeExecutors} from "@/features/workflows/nodes/node-executors"

import {getWorkflow} from "@/features/workflows/data"

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

        let stagehand: Stagehand | undefined
        const getStagehand = async () => {
            if(stagehand) return stagehand
            stagehand = new Stagehand({
                env: "BROWSERBASE",
                apiKey: process.env.BROWSERBASE_API_KEY || "",
                model: "google/gemini-2.5-flash",
                disablePino: true,
            })
            await stagehand.init()
            return stagehand
        }


        for(const id of order){
            const node = byId.get(id)
            logger.log(`Running node ${node?.data.title} (${node?.id}) of type ${node?.data.kind}`)

            const executor = nodeExecutors[node!.data.type]
            if(executor) await executor({values: node!.data.values, getStagehand})
        }

        await stagehand?.close()

        return {steps: order.length}
    },
})