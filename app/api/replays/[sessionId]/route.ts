import { auth } from "@clerk/nextjs/server"
import { Browserbase, type APIError } from "@browserbasehq/sdk"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { orgId } = await auth()
  if (!orgId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  const { sessionId } = await params

  const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY ?? "" })

  try {
    const meta = await bb.sessions.replays.retrieve(sessionId)
    const firstPage = meta.pages[0]
    if (!firstPage) {
      return NextResponse.json(
        { error: "Replay not found" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      )
    }

    const playlist = await bb.sessions.replays.retrievePage(
      sessionId,
      firstPage.pageId
    )
    const m3u8 = await playlist.text()

    return new NextResponse(m3u8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    const status = (error as APIError)?.status ?? 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Replay error" },
      { status, headers: { "Cache-Control": "no-store" } }
    )
  }
}
