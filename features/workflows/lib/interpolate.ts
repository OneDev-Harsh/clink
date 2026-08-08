const PLACEHOLDER_PATTERN = /\{\{\s*([^{}\s]+)\s*\}\}/g

function getByPath(root: unknown, path: string): unknown {
    const segments = path.split(/[.\[\]]+/).filter(Boolean)
    let current: unknown = root
    for (const segment of segments) {
        if (current === undefined || current === null) return undefined
        current = (current as Record<string, unknown>)[segment]
    }
    return current
}

// Swaps {{nodeId.path.to.value}} placeholders in a field's text for the
// matching output of that node from this run. Unknown placeholders resolve to
// an empty string; object values are inlined as JSON.
export function interpolate(text: string, outputs: Record<string, unknown>): string {
    return text.replace(PLACEHOLDER_PATTERN, (_, expression: string) => {
        const dotIndex = expression.indexOf(".")
        const nodeId = dotIndex === -1 ? expression : expression.slice(0, dotIndex)
        const path = dotIndex === -1 ? "" : expression.slice(dotIndex + 1)

        const value = path ? getByPath(outputs[nodeId], path) : outputs[nodeId]

        if (value === undefined || value === null) return ""
        if (typeof value === "object") return JSON.stringify(value)
        return String(value)
    })
}
