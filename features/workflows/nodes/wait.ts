// Pauses the flow for a fixed number of seconds before continuing.
export async function waitNode({ duration }: { duration: string }) {
    const seconds = Number.parseFloat(duration)
    if (!Number.isFinite(seconds) || seconds < 0) {
        throw new Error(`Invalid wait duration: "${duration}"`)
    }

    const waitedMs = Math.round(seconds * 1000)
    if (waitedMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitedMs))
    }

    return { waitedMs }
}
