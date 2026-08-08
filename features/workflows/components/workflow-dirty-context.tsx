"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useStore, type Edge } from "@xyflow/react"

import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

export type DirtyContextValue = {
  isDirty: boolean
  markSaved: (nodes: StepNodeType[], edges: Edge[]) => void
}

// A stable fingerprint of the parts of the graph that matter for "saved":
// nodes by id/type/position/data and edges by endpoints. Ignores selection,
// measured sizes, and other transient store fields.
export function workflowSignature(
  nodes: StepNodeType[],
  edges: Edge[]
): string {
  return JSON.stringify({
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    })),
  })
}

const DirtyContext = createContext<DirtyContextValue>({
  isDirty: false,
  markSaved: () => {},
})

export function useDirty() {
  return useContext(DirtyContext)
}

// Watches the React Flow store and flags when the graph diverges from the
// last saved signature.
function DirtyTracker({
  savedSignature,
  setIsDirty,
}: {
  savedSignature: string | null
  setIsDirty: (dirty: boolean) => void
}) {
  const nodes = useStore((s) => s.nodes) as StepNodeType[]
  const edges = useStore((s) => s.edges)
  const signature = useMemo(() => workflowSignature(nodes, edges), [nodes, edges])

  useEffect(() => {
    setIsDirty(signature !== savedSignature)
  }, [signature, savedSignature, setIsDirty])

  return null
}

export function WorkflowDirtyProvider({
  initialSignature,
  children,
}: {
  initialSignature: string | null
  children: ReactNode
}) {
  const [savedSignature, setSavedSignature] = useState<string | null>(
    initialSignature
  )
  const [isDirty, setIsDirty] = useState(initialSignature === null)

  const markSaved = useCallback((nodes: StepNodeType[], edges: Edge[]) => {
    setSavedSignature(workflowSignature(nodes, edges))
    setIsDirty(false)
  }, [])

  // Warn before leaving while there are unsaved changes: covers refresh/close
  // and the browser back/forward buttons. App Router soft-link navigation
  // isn't interceptable from here.
  useEffect(() => {
    if (!isDirty) return

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    const onPopState = () => {
      if (!window.confirm("You have unsaved changes. Leave anyway?")) {
        window.history.pushState(null, "")
      }
    }

    window.addEventListener("beforeunload", onBeforeUnload)
    window.addEventListener("popstate", onPopState)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      window.removeEventListener("popstate", onPopState)
    }
  }, [isDirty])

  return (
    <DirtyContext.Provider value={{ isDirty, markSaved }}>
      {children}
      <DirtyTracker savedSignature={savedSignature} setIsDirty={setIsDirty} />
    </DirtyContext.Provider>
  )
}
