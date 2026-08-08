import { wait } from "@trigger.dev/sdk"

// Pauses the flow for a fixed number of seconds before continuing. Uses a
// durable Trigger.dev wait so the run survives machine restarts and retries.
export async function waitNode({ duration }: { duration: string }) {
    const seconds = Number.parseFloat(duration)
    if (!Number.isFinite(seconds) || seconds < 0) {
        throw new Error(`Invalid wait duration: "${duration}"`)
    }

    const waitedMs = Math.round(seconds * 1000)
    if (seconds > 0) {
        await wait.for({ seconds })
    }

    return { waitedMs }
}
