import {useMemo} from "react"
import {getIncomers, useEdges, useNodes} from "@xyflow/react"

import {
    nodeRegistry,
    type NodeType,
    type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

export type UpstreamConnection = {
    token: string
    label: string
    type: NodeType
}

// Every output any node upstream of the given (selected) node exposes, each
// ready to insert into a field as a {{nodeId.path}} token. Follows connections
// all the way back through the graph and re-computes whenever nodes or edges
// change.
export function useUpstreamConnections(node: StepNodeType | undefined): UpstreamConnection[] {
    const nodes = useNodes<StepNodeType>()
    const edges = useEdges()

    return useMemo(() => {
        if (!node) return []

        const upstream: StepNodeType[] = []
        const visited = new Set([node.id])
        const queue: StepNodeType[] = [node]

        while (queue.length > 0) {
            const current = queue.shift()!
            for (const incomer of getIncomers(current, nodes, edges)) {
                if (visited.has(incomer.id)) continue
                visited.add(incomer.id)
                upstream.push(incomer)
                queue.push(incomer)
            }
        }

        return upstream.flatMap((upstreamNode) =>
            (nodeRegistry[upstreamNode.data.type]?.outputs ?? []).map((output) => ({
                token: `{{${upstreamNode.id}.${output.path}}}`,
                label: `${upstreamNode.data.title} : ${output.label}`,
                type: upstreamNode.data.type,
            }))
        )
    }, [node, nodes, edges])
}
