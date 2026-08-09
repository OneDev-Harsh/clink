# Clink

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Clerk](https://img.shields.io/badge/Clerk-7-6C47FF?logo=clerk&logoColor=white)](https://clerk.com)
[![Trigger.dev](https://img.shields.io/badge/Trigger.dev-4.5-black?logo=triggerdotdev&logoColor=white)](https://trigger.dev)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Neon](https://img.shields.io/badge/Neon-00E599?logo=neon&logoColor=black)](https://neon.tech)
[![Browserbase](https://img.shields.io/badge/Browserbase-FF7A00?logo=browserbase&logoColor=white)](https://browserbase.com)
[![Stagehand](https://img.shields.io/badge/Stagehand_V3-3.7-blue?logo=stagehand&logoColor=white)](https://stagehand.dev)
[![Resend](https://img.shields.io/badge/Resend-6-000000?logo=resend&logoColor=white)](https://resend.com)
[![React Flow](https://img.shields.io/badge/React_Flow-12-FF0072?logo=reactflow&logoColor=white)](https://reactflow.dev)

**Design, run, and replay AI-powered browser automation — as a visual workflow.**

Clink is a multi-tenant workflow automation platform where you compose browser
tasks by connecting nodes on a canvas. Each workflow starts with a trigger and
chains a series of actions — opening pages, clicking around, extracting data,
delegating multi-step goals to an autonomous agent, waiting, or sending email.
Runs happen in a real, cloud-hosted browser ([Browserbase](https://browserbase.com)
+ [Stagehand](https://stagehand.dev)), execute durably on
[Trigger.dev](https://trigger.dev), and ship with a full video replay you can
watch after every run.

---

## Highlights

- **Visual workflow editor** built on [React Flow](https://reactflow.dev) — drag
  nodes, connect them, pan/zoom, minimap, and a live canvas that paints each step
  as it executes.
- **AI-native browser actions** powered by [Stagehand V3](https://stagehand.dev):
  `Open URL`, `Act`, `Extract`, `Observe`, and `Agent` (multi-step autonomous
  browsing).
- **Data passthrough** between steps via `{{nodeId.output.path}}` tokens, with
  click-to-insert tokens surfaced automatically from every upstream node.
- **Live run telemetry** — runs stream their status and per-step progress into
  the console in real time over [Trigger.dev](https://trigger.dev)'s realtime
  protocol.
- **Session replay** — every completed run records its browser session; watch it
  as HLS video right inside the console, authorized per-organization.
- **Durable execution** — the run task lives in Trigger.dev, survives retries and
  restarts, and waits (even the `Wait` node) are durable.
- **Multi-tenant by design** — authentication and organization scoping via
  [Clerk](https://clerk.com); every workflow, run, and replay is owned and
  isolated by organization.
- **Registry-driven node system** — adding a new node is one impl file, one
  executor mapping, and one manifest entry.

---

## Tech Stack

| Layer            | Technology                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org) (App Router, React 19, TypeScript)        |
| UI               | [shadcn/ui](https://ui.shadcn.com) + Base UI, Tailwind CSS 4, React Flow   |
| Styling          | Tailwind CSS 4, next-themes (dark/light)                                   |
| Authentication   | [Clerk](https://clerk.com) (organizations, multi-tenancy)                  |
| Database         | [Neon](https://neon.tech) Postgres via [Drizzle ORM](https://orm.drizzle.team) |
| Background tasks | [Trigger.dev](https://trigger.dev) (`run-workflow` task, realtime hooks)   |
| Browser          | [Browserbase](https://browserbase.com) + [Stagehand V3](https://stagehand.dev) |
| Email            | [Resend](https://resend.com)                                               |
| Video replay     | Browserbase session recordings served as HLS (`hls.js`)                   |

---

## How It Works

### 1. Compose a workflow

Every workflow is a directed graph stored as JSONB in [Neon](https://neon.tech)
Postgres. A graph has exactly **one trigger node** (the `Start`) and any number
of connected **action nodes**. You build it visually:

- **Toolbar tab** — add nodes from a palette, grouped into *Triggers* and
  *Actions*.
- **Canvas** — arrange and connect nodes by dragging from a source handle to a
  target handle.
- **Editor tab** — select a node to edit its fields, delete it, or insert
  upstream outputs as tokens with a single click.
- **Save / Run** — persist the graph, or validate and kick off a run.

The graph is validated before it can run: it must have exactly one trigger,
at least two connected nodes, and no cycles (topological order is computed with
`toposort`).

### 2. Pass data between steps

Each node declares typed *outputs*. Any downstream node can reference them in
its fields using token interpolation:

```
{{nodeId.output.path}}
```

For example, an `Act` node exposes `{{nodeId.success}}`, `{{nodeId.message}}`,
and `{{nodeId.url}}`. When a workflow runs, tokens are resolved against the
produced outputs of upstream nodes — object values are inlined as JSON, missing
references resolve to an empty string (with a warning logged so silent failures
are easy to spot).

### 3. Run it

The **Run** button saves the current graph, validates it, and triggers the
`run-workflow` task on [Trigger.dev](https://trigger.dev). The task:

1. Loads the workflow and topologically sorts its connected nodes.
2. Lazily boots a single [Stagehand](https://stagehand.dev) browser session
   ([Browserbase](https://browserbase.com), headless) on the first
   browser-touching node and records its session ID.
3. Executes each node's executor in order, interpolating tokens, streaming
   per-step status (`pending → running → done/failed`) to run metadata in real
   time.
4. Closes the browser in a `finally` block and marks the recorded session as
   `completed` or `failed`.

The dashboard subscribes to runs tagged `workflow:<id>` over Trigger.dev
realtime, so the console and the canvas update live while a run is in flight.

### 4. Inspect and replay

The **Console** below the canvas lists every run with its nested steps. Select a
step to see its output as pretty JSON or its error. When a run finishes, a
**Replay** row appears — clicking it streams the recorded browser session as HLS
video, proxied server-side through `/api/replays/:sessionId` so the secret
[Browserbase](https://browserbase.com) API key never reaches the client.

---

## Node Reference

| Node         | Kind    | What it does                                                      | Outputs                                            |
| ------------ | ------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| `start`      | Trigger | Begins the workflow; takes no input                               | —                                                  |
| `open-url`   | Action  | Navigates the browser to a URL                                    | `url`, `title`                                     |
| `act`        | Action  | Performs a single, atomic UI action (click, type, …)              | `success`, `message`, `url`                        |
| `extract`    | Action  | Pulls structured data out of the current page                     | `extraction`                                       |
| `observe`    | Action  | Lists candidate page actions matching an instruction              | `matches`                                          |
| `agent`      | Action  | Runs a multi-step autonomous agent to complete a goal             | `success`, `message`, `completed`                  |
| `send-email` | Action  | Sends a transactional email via [Resend](https://resend.com)             | `id`                                               |
| `wait`       | Action  | Pauses the run for a fixed number of seconds (durable wait)       | `waitedMs`                                         |

### Adding a node

The system is registry-driven — the canvas, task, and inspector are all generic.
To add a new node, make three edits under `features/workflows/nodes/`:

1. **`<your-node>.ts`** — the executor logic (the function that does the work).
2. **`node-executors.ts`** — register the executor; the `satisfies` contract
   makes a missing executor a compile error for action nodes.
3. **`node-registry.ts`** — add its manifest entry: `type`, `kind`, `label`,
   `icon`, `accent`, input `fields`, and the `outputs` downstream nodes can
   reference.

---

## Getting Started

### Prerequisites

- Node.js 20+
- An account/credentials for each service you want to use (see below)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the required variables into `.env.local`. All keys are consumed server-side
except the [Clerk](https://clerk.com) publishable key.

| Variable                               | Required | Description                                       |
| -------------------------------------- | -------- | ------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`    | Yes      | Clerk publishable key (client)                    |
| `CLERK_SECRET_KEY`                     | Yes      | Clerk secret key (server)                         |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`        | Yes      | Clerk sign-in route                               |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`        | Yes      | Clerk sign-up route                               |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Yes | Post sign-in redirect                  |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Yes | Post sign-up redirect                  |
| `DATABASE_URL`                         | Yes      | [Neon](https://neon.tech) Postgres pooled connection string              |
| `DATABASE_URL_UNPOOLED`                | Yes      | Neon Postgres direct connection (migrations)      |
| `TRIGGER_SECRET_KEY`                   | Yes      | [Trigger.dev](https://trigger.dev) project secret key                     |
| `BROWSERBASE_API_KEY`                  | Yes*     | [Browserbase](https://browserbase.com) + Stagehand cloud browser sessions |
| `RESEND_API_KEY`                       | Yes*     | Email delivery for the `send-email` node via [Resend](https://resend.com) |

\* Required only for the features that use them — browser nodes and email,
respectively.

### 3. Prepare the database

```bash
npm run db:migrate   # or npm run db:push
```

### 4. Run locally

You'll need two processes: the Next.js app and the [Trigger.dev](https://trigger.dev)
worker.

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Trigger.dev worker (executes the run-workflow task locally)
npx trigger dev
```

Open `http://localhost:3000`, sign in, create or pick an organization, and create
a workflow.

---

## Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the Next.js dev server                 |
| `npm run build`     | Production build                             |
| `npm run start`     | Start the production server                  |
| `npm run lint`      | Run ESLint                                   |
| `npm run format`    | Format source with Prettier                  |
| `npm run typecheck` | Type-check the project (`tsc --noEmit`)      |
| `npm run db:generate` | Generate a [Drizzle](https://orm.drizzle.team) migration            |
| `npm run db:migrate` | Apply pending Drizzle migrations           |
| `npm run db:push`   | Push the schema directly (dev-friendly)      |

---

## Project Structure

```
app/
  (auth)/                     Clerk sign-in / sign-up / org chooser
  (dashboard)/                App shell, workflow list + editor
  api/replays/[sessionId]/    Proxies Browserbase replay as HLS (server-side)
  layout.tsx                  Root layout: Clerk + theme + toaster
components/
  ui/                         shadcn/ui primitives
  app-sidebar.tsx             Organization + workflow navigation
features/workflows/
  components/                 Canvas, console, inspector, logs, replay, sidebar
  hooks/use-upstream-connections.ts
  lib/                        Server actions, validation, interpolation, slug
  nodes/                      Executors + the registry (add nodes here)
  tasks/run-workflow.ts       The Trigger.dev task that executes a workflow
  data.ts                     Drizzle queries (workflows + workflow runs)
lib/
  db/                         Drizzle schema, Neon client, migrations
  resend.ts                   Resend client
trigger.config.ts             Trigger.dev project + task configuration
drizzle.config.ts             Drizzle Kit configuration
```

### Data model

- **`workflows`** — `id`, `org_id`, `name`, `graph` (JSONB: `{ nodes, edges }`),
  `created_at`, `updated_at`.
- **`workflow_runs`** — `id`, `workflow_id`, `org_id`, `session_id` (unique),
  `status`, `created_at`, `updated_at`. Exists so the replay endpoint can verify
  ownership before streaming a recording.

Both tables are scoped by `org_id`, which is how tenancy and replay
authorization are enforced.

---

## Roadmap Ideas

- Scheduled / cron triggers.
- Branching nodes and parallel execution.
- Live browser view alongside the console.
- Version history and workflow templates.
- Shared/team node libraries.

---

## Contributing

Contributions are welcome. Please keep changes consistent with the existing
conventions:

- Follow the node-registry contract when adding nodes (see above).
- Derive database types from the Drizzle schema via `$inferSelect` / `$inferInsert`
  rather than hand-writing table shapes.
- Run `npm run lint` and `npm run typecheck` before opening a PR.
