import toposort from "toposort"
import { type WorkflowGraph } from "@/lib/db/schema"

export function validateGraph({nodes, edges}: WorkflowGraph): string[] {
    const problems: string[] = []

    const triggers = nodes.filter(node => node.data.kind === "trigger").length
    if(triggers!==1){
        problems.push(`Workflow must have exactly one Start trigger node, found ${triggers}`)
    }

    if(edges.length === 0){
        problems.push("Workflow must have at least two nodes connected")
    } else{
        try{
            toposort(edges.map(edge => [edge.source, edge.target]))
        } catch (error) {
            problems.push("Workflow has a cycle - please remove the loop to continue")
        }
    }

    return problems
}