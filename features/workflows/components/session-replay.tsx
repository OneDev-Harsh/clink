"use client"

import Hls from "hls.js"
import { useEffect, useRef, useState } from "react"

import { Spinner } from "@/components/ui/spinner"

type ReplayStatus =
  | { state: "checking" }
  | { state: "ready" }
  | { state: "error"; message: string }

const POLL_INTERVAL_MS = 3000
const MAX_WAIT_MS = 5 * 60 * 1000

export function SessionReplay({ sessionId }: { sessionId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<ReplayStatus>({ state: "checking" })

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const startedAt = Date.now()

    const retry = () => {
      if (cancelled) return
      if (Date.now() - startedAt >= MAX_WAIT_MS) {
        setStatus({ state: "error", message: "Timed out waiting for the replay." })
        return
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    async function poll() {
      if (cancelled) return

      let res: Response
      try {
        res = await fetch(`/api/replays/${sessionId}`, { cache: "no-store" })
      } catch {
        retry()
        return
      }
      if (cancelled) return

      if (res.status === 401 || res.status === 403) {
        setStatus({ state: "error", message: "You don't have access to this replay." })
        return
      }

      const contentType = res.headers.get("content-type") ?? ""
      if (res.ok && contentType.includes("mpegurl")) {
        setStatus({ state: "ready" })
        return
      }

      retry()
    }

    poll()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [sessionId])

  useEffect(() => {
    if (status.state !== "ready") return
    const video = videoRef.current
    if (!video) return

    const src = `/api/replays/${sessionId}`

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
      return () => hls.destroy()
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src
      return
    }

    setStatus({ state: "error", message: "HLS playback isn't supported in this browser." })
  }, [status.state, sessionId])

  if (status.state === "checking") {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Preparing replay…
      </div>
    )
  }

  if (status.state === "error") {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-destructive">
        {status.message}
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      className="h-full w-full bg-black"
      controls
      playsInline
      muted
    />
  )
}
