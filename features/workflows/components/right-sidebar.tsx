"use client"

import { useState, useTransition } from "react"
import { useReactFlow, useStore, useStoreApi } from "@xyflow/react"
import { Play, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResizablePanel } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import {
  deleteWorkflowAction,
  runWorkflowAction,
  saveWorkflowAction,
} from "@/features/workflows/lib/actions"
import { validateGraph } from "@/features/workflows/lib/validate-graph"
import { useUpstreamConnections } from "@/features/workflows/hooks/use-upstream-connections"

import { NodeIcon } from "@/features/workflows/components/node-icon"
import { useDirty } from "@/features/workflows/components/workflow-dirty-context"
import {
  nodeRegistry,
  type NodeDefinition,
  type NodeField,
  type NodeType,
  type StepNodeKind,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

// This file builds up to the RightSidebar component exported at the bottom: a
// header with workflow actions (delete, run), then two tabs — a Toolbar for
// adding nodes and an Editor for tweaking the selected node. Each helper below is
// defined just above the block that uses it.

// ---------------------------------------------------------------------------
// Shared pieces — used by both the Toolbar and the Editor.
// ---------------------------------------------------------------------------

// A titled, scrollable panel. Each tab renders its content inside one.
function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string
  icon?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-y border-border bg-muted/30 px-3 py-2 text-sm font-semibold">
        {icon}
        {title}
        {action && <span className="ml-auto">{action}</span>}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor tab — edits the fields of the selected node.
// ---------------------------------------------------------------------------

// A single editor field for a node property.
function FieldInput({
  field,
  value,
  onChange,
}: {
  field: NodeField
  value: string
  onChange: (value: string) => void
}) {
  if (field.multiline) {
    return (
      <Textarea
        id={field.key}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  return (
    <Input
      id={field.key}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// The Editor tab: one input per field on the selected node, or an empty state.
function Inspector({ node }: { node: StepNodeType | undefined }) {
  const { updateNodeData, deleteElements } = useReactFlow<StepNodeType>()
  const connections = useUpstreamConnections(node)
  const [lastEditedField, setLastEditedField] = useState<string | undefined>()
  const [prevNodeId, setPrevNodeId] = useState(node?.id)

  if (node && node.id !== prevNodeId) {
    setPrevNodeId(node.id)
    setLastEditedField(undefined)
  }

  if (!node) {
    return (
      <Section title="Editor">
        <div className="flex flex-col items-center gap-1.5 px-6 py-12 text-center">
          <span className="text-xs font-medium text-muted-foreground">
            No node selected
          </span>
          <span className="text-[11px] text-muted-foreground/70">
            Select a node on the canvas to edit its properties.
          </span>
        </div>
      </Section>
    )
  }

  const { type, title, values } = node.data
  const def: NodeDefinition = nodeRegistry[type]

  const insertToken = (token: string) => {
    const fieldKey = lastEditedField ?? def.fields[0]?.key
    if (!fieldKey) return
    updateNodeData(node.id, {
      ...node.data,
      values: {
        ...node.data.values,
        [fieldKey]: (values[fieldKey] ?? "") + token,
      },
    })
  }

  return (
    <Section
      title={title}
      icon={<NodeIcon type={type} />}
      action={
        <Button
          size="icon-xs"
          variant="destructive"
          aria-label={`Delete ${title}`}
          onClick={() => deleteElements({ nodes: [{ id: node.id }] })}
        >
          <Trash2 />
        </Button>
      }
    >
      <div className="flex flex-col gap-3 p-3">
        {def.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">No properties</p>
        ) : (
          def.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key} className="text-xs">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              <FieldInput
                field={field}
                value={values[field.key] ?? ""}
                onChange={(value) => {
                  setLastEditedField(field.key)
                  updateNodeData(node.id, {
                    ...node.data,
                    values: { ...node.data.values, [field.key]: value },
                  })
                }}
              />
            </div>
          ))
        )}

        {connections.length > 0 && (
          <div className="flex flex-col gap-1.5 border-t border-border pt-3">
            <Label className="text-xs">Connections</Label>
            <div className="flex flex-wrap gap-1.5">
              {connections.map((connection) => (
                <Badge
                  key={connection.token}
                  asChild
                  variant="outline"
                  className="cursor-pointer hover:bg-muted hover:text-muted-foreground"
                >
                  <button
                    type="button"
                    onClick={() => insertToken(connection.token)}
                  >
                    <NodeIcon type={connection.type} className="size-4" />
                    {connection.label}
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Toolbar tab — adds nodes to the canvas, grouped by kind.
// ---------------------------------------------------------------------------

// The Toolbar's groups, one accordion section per node kind.
const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "Triggers" },
  { kind: "action", label: "Actions" },
]

// Every node type from the registry, filtered into the groups below.
const definitions = Object.values(nodeRegistry)

// The Toolbar tab: a button per node type that adds it to the canvas.
function Palette() {
  const { screenToFlowPosition, addNodes } = useReactFlow<StepNodeType>()
  const storeApi = useStoreApi<StepNodeType>()

  const add = (type: NodeType) => {
    const def = nodeRegistry[type]
    const { nodes, domNode } = storeApi.getState()

    if (
      def.kind === "trigger" &&
      nodes.some((node) => node.data?.kind === "trigger")
    ) {
      toast.error("Only one trigger node is allowed")
      return
    }

    if (!domNode) return

    const rect = domNode.getBoundingClientRect()
    const position = screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })

    const count = nodes.filter((node) => node.data?.type === type).length

    addNodes({
      id: crypto.randomUUID(),
      type: "step",
      position,
      data: {
        type,
        kind: def.kind,
        title: `${def.label} ${count + 1}`,
        values: {},
      },
    })
  }

  return (
    <Section title="Toolbar">
      <Accordion
        type="multiple"
        defaultValue={sections.map((s) => s.kind)}
        className="px-3 py-2"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.kind}
            value={section.kind}
            className="not-last:border-b-0"
          >
            <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-0.5">
              {definitions
                .filter((def) => def.kind === section.kind)
                .map((def) => (
                  <Button
                    key={def.type}
                    variant="ghost"
                    onClick={() => add(def.type as NodeType)}
                    className="group justify-start gap-2.5 rounded-md px-2 py-1.5 text-xs font-medium hover:bg-muted/70"
                  >
                    <NodeIcon
                      type={def.type as NodeType}
                      className="transition-transform group-hover:scale-105"
                    />
                    {def.label}
                  </Button>
                ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Header — workflow-level actions shown above the tabs.
// ---------------------------------------------------------------------------

// Deletes the workflow, behind a confirmation dialog.
function DeleteWorkflowButton({ workflowId }: { workflowId: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Delete workflow"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete workflow?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the workflow and all of its runs. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              deleteWorkflowAction(workflowId)
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Persists the current workflow graph (nodes, edges, values) to the database.
function SaveButton({ workflowId }: { workflowId: string }) {
  const { getNodes, getEdges } = useReactFlow<StepNodeType>()
  const [isPending, startTransition] = useTransition()
  const { isDirty, markSaved } = useDirty()

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const graph = { nodes: getNodes(), edges: getEdges() }
          await saveWorkflowAction({ id: workflowId, graph })
          markSaved(getNodes(), getEdges())
          toast.success("Workflow saved")
        })
      }}
      className="text-muted-foreground hover:bg-muted/70 hover:text-foreground"
    >
      <Save />
      Save
      {isDirty && (
        <span
          aria-label="Unsaved changes"
          className="size-1.5 rounded-full bg-amber-500"
        />
      )}
    </Button>
  )
}

// Kicks off a run of the current workflow.
function RunButton({ workflowId }: { workflowId: string }) {
  const { getNodes, getEdges } = useReactFlow<StepNodeType>()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      disabled={isPending}
      onClick={() => {
        // TODO: validate the graph and run the workflow (toggle to Stop while running).
        const graph = { nodes: getNodes(), edges: getEdges() }
        const problems = validateGraph(graph)
        if (problems.length > 0) {
          toast.error(problems[0])
          return
        }

        startTransition(async () => {
          await runWorkflowAction({ id: workflowId, graph })
        })
      }}
      className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-600/25 hover:from-emerald-400 hover:to-green-500 hover:text-white"
    >
      <Play className="size-3.5 fill-current" />
      Run
    </Button>
  )
}

// ---------------------------------------------------------------------------
// The sidebar itself — header on top, then the Toolbar / Editor tabs.
// ---------------------------------------------------------------------------

export function RightSidebar({ workflowId }: { workflowId: string }) {
  const [tab, setTab] = useState("toolbar")

  // TODO: read the currently selected node from React Flow.
  const selected = useStore((s) => s.nodes.find((node) => node.selected)) as
    StepNodeType | undefined

  // TODO: auto-switch to the Editor tab when the selection changes.
  const [prevSelectId, setPrevSelectId] = useState(selected?.id)
  if (selected && selected.id !== prevSelectId) {
    setPrevSelectId(selected.id)
    setTab("editor")
  }

  return (
    <ResizablePanel
      className="bg-background"
      defaultSize="16rem"
      minSize="14rem"
      maxSize="36rem"
      groupResizeBehavior="preserve-pixel-size"
    >
      <Tabs value={tab} onValueChange={setTab} className="size-full gap-0">
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/20 p-2">
          <DeleteWorkflowButton workflowId={workflowId} />
          <div className="ml-auto flex items-center gap-1.5">
            <SaveButton workflowId={workflowId} />
            <RunButton workflowId={workflowId} />
          </div>
        </div>
        <div className="px-2 pt-2 pb-1.5">
          <TabsList className="w-full bg-muted/40">
            <TabsTrigger
              value="toolbar"
              className="flex-1 rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
            >
              Toolbar
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              className="flex-1 rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
            >
              Editor
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="toolbar" className="flex min-h-0 flex-col">
          <Palette />
        </TabsContent>
        <TabsContent value="editor" className="flex min-h-0 flex-col">
          <Inspector node={selected} />
        </TabsContent>
      </Tabs>
    </ResizablePanel>
  )
}
