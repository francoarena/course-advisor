# Stack profile

Answers to the verification interface
(`references/profile-interface.md`) for this project's stack: Next.js 16
(App Router) + TypeScript + React 19, Tailwind CSS 4, `dnd-kit`,
`pdfjs-dist`, Supabase (Postgres + Auth), Vercel. Derived at kickoff, before
the app is scaffolded — expect ~80% here, the rest hardens once
`spec-feature`/`implement-milestone` actually run it (per the interface's own
disclaimer). The Next.js/App Router ladder below is seeded from the
**hardened** (2026-07) entry in `references/feedback-ladders.md`.

The app lives at the **repo root** (alongside `specs/`), not a subdirectory —
one repo, one deployable.

## Q1 — Source roots

`app/` (routes + API route handlers), `lib/` (PDF parsing, Supabase clients,
business logic), `components/` (UI primitives + feature components),
`supabase/migrations/` (schema). These don't exist yet — created by the
first milestone that scaffolds the app.

## Q2 — Surface

A rendered Next.js route/page (`app/**/page.tsx`), or an API route handler
(`app/api/**/route.ts`) for actions like PDF-upload processing.

## Q3 — Activate + assert healthy

- Page/route: Playwright renders it authenticated (seeded session, Q5),
  asserts no error boundary fired and no console/network errors.
- API route: request it, assert a 2xx status and a schema-valid JSON body.
- Runs against both the dev build and the production build (Q6).

⚠ Escalation hole this stack actually has: async Server Components cannot be
rendered below e2e — the framework's own guidance is to keep them thin and
extract logic into unit-testable functions, and cover the RSC boundary
itself only at the Playwright tier.

## Q4 — Drive action + assert effect

Trigger the action through the UI or API route, then assert its effect
directly against Supabase (a service-role test client reading the row) —
e.g. uploading a worksheet asserts `plans`/`requirement_groups`/
`course_requirements` rows exist with the parsed values; dragging a course
card asserts `course_requirements.placed_semester_id` changed to the target
semester's id.

## Q5 — Seed test state

Supabase's admin API (service-role key, dev project) mints a test user
directly — no email/sign-up flow — and a seed script inserts a known Plan +
RequirementGroups + CourseRequirements fixture for that user. No human, no
email, at any tier above unit.

## Q6 — Dev build vs production build

- Dev: `next dev`.
- Production-equivalent: `next build && next start`.
- What each catches that the other doesn't: the production build applies
  React's server/client compilation split and minification — a Server
  Component passed the wrong prop shape, or code that only breaks once
  transformed, reaches green in dev and fails only in the production build.
  The runtime walk (§3 of the verification rules) runs against **both**.

## Q7 — Live/external proof

N/A — no external AI/paid service calls in v1 (see `01-architecture.md`'s
environment contract; Supabase and Vercel are infrastructure, not
per-call-billed AI/external calls).

## Q8 — Design surface

**Q8.1 — Has UI?** Yes. Full design track applies.

**Q8.2 — Token source + install.** CSS custom properties, two-tier
(primitive → semantic), declared in `app/globals.css` via Tailwind 4's
`@theme` layer and installed onto components through Tailwind's theme
config (components read semantic classes/vars, never raw hex/duration
values). Interaction-state and motion tokens (hover/pressed/focus/disabled
deltas, easing/duration) live in the same sheet. Owned in full by
`specs/design.md` once the design-system gate runs.

**Q8.3 — Workbench mechanism.** A `/styleguide` route in the Next.js app
that imports the real primitives and lays them out in every state (default /
hover / pressed / focus / disabled / loading / empty / error). Built at the
design-system gate, durable thereafter as the fidelity source of truth.

**Q8.4 — Screenshot/review driver.** Playwright headless-browser screenshot
of the rendered route/gallery. Playwright can also record a trace/video of
an interaction (e.g. a drag-and-drop sequence) when richer evidence is
useful — optional, never replaces the screenshot.

**Q8.5 — Motion + interaction.** CSS transitions driven by the easing/
duration tokens from Q8.2, plus `dnd-kit`'s built-in drag transforms for the
board; whether a JS motion library (e.g. Framer Motion) is added for card
transitions is decided at the design-system gate, not here. Interaction-state
tokens applied on `:hover` / `:focus-visible` / `[data-pressed]`.
Reduce-motion read once from the `prefers-reduced-motion` media query at the
token layer — never per-component.

**Q8.6 — Platform-convention set.** Web conventions: pointer + keyboard,
browser-native focus order, standard form controls themed through tokens.
The drag-and-drop board must have a keyboard-operable equivalent (`dnd-kit`
ships a keyboard sensor) — this is a native-feel requirement, not optional,
since the audience includes assistive-tech users.

## Q9 — Schema/state versioning

Supabase migrations via `supabase migration new <name>`, which produces a
UTC-timestamp-named file — collision-free under parallel branches. Any
migration creating a *shared* object (e.g. a table two sibling milestones
both need) is written idempotent (`create table if not exists` /
`create or replace`) so the earliest-merged migration wins and the rest
no-op.

## Q10 — Deployed verification surface

The Vercel preview deployment created for each PR (project `arena-co/course-advisor`,
GitHub-connected, so every PR gets one automatically). **Finalized at
provision:** `vercel project inspect` doesn't surface deployment-protection
state at all (a CLI gap, not a signal) — it was actually **on** (Vercel
Authentication/SSO, defaulted on for this team-owned project) and a direct
curl to the preview URL 302'd to `vercel.com/sso-api` until the user
disabled it in the dashboard (Project Settings → Deployment Protection).
Confirmed off now by a direct curl returning 200 on both the preview and
production URLs (see `01-architecture.md`'s deployed-URLs line) — a scripted
smoke hits either directly, no bypass header needed. **Don't trust `vercel
project inspect` to answer this question** — verify with a real curl instead.
Re-check if the org's Vercel plan or settings change; if protection is ever
turned back on, record the `VERCEL_AUTOMATION_BYPASS_SECRET` var name (not
its value) here and in
`01-architecture.md`'s environment contract.

## Q11 — Test tiers (committed-test ladder)

| Tier | Command | Speed | Catches |
|---|---|---|---|
| Static | `tsc --noEmit` + `eslint .` | sub-seconds, incremental | shape/type errors, lint smells |
| Unit | `vitest run` (unit project) | ms/test | pure logic — parser functions, progress-math, placement algorithm |
| Component-render | `vitest run` (browser-mode/component project — **check currency at build time**, the ecosystem is mid-migration to real-browser Vitest per the dated feedback-ladder entry) | ~10-1000ms/test | deterministic interaction bugs: drag-and-drop reordering, dropdown selection, focus order — real component/screen tree, not pure functions |
| End-to-end | `playwright test` | seconds/test + server boot | full spine journey against a real server (upload → board → drag → save), environment-level breakage |

**Escalation holes** (structurally invisible below the runtime walk on this
stack): async Server Components (Q3's note); dev-vs-prod build transform
divergence (Q6). **Scaffold gap:** `create-next-app` ships no test runner at
all — the first scaffolding milestone installs Vitest + Playwright rather
than assuming either exists. **Flake traps:** DOM-emulation harnesses
diverge from real rendering at server/client boundaries — prefer the
component-render tier's real-browser mode once wired; any external-store
hook (e.g. a shared drag-state store) needs referentially-stable snapshots,
or it can infinite-loop at runtime while every unit test stays green.

## Q12 — Local substrate contract

- **Shared local singleton:** the Next.js dev server (`next dev`) only —
  this project talks to the **hosted** Supabase dev project directly (no
  local Postgres/Docker stack), since a solo/small-team project doesn't
  carry the complexity of a local Supabase CLI stack. Health check: a
  request to `/` (or a trivial `/api/health` route once one exists) returns
  200. The health check also asserts the resolved `NEXT_PUBLIC_SUPABASE_URL`
  matches the **dev** project's URL (never the eventual production project's
  URL) — environment-target classification, so a copied prod env file can't
  silently point local dev at production.
- **Unique port block / project identity:** `21225` (hash of "course-advisor"
  into the 20000–30000 band, below the 32768 ephemeral-port floor). Bound by
  `npm run dev` / `npm run start` (`next dev -p 21225` / `next start -p
  21225`) and recorded in `.claude/launch.json`. Changing it later requires
  updating both `package.json`'s scripts and `.claude/launch.json` together —
  there's no hosted dashboard entry to keep in sync since this port is
  local-dev-server-only, not a Supabase/Vercel setting.
- **Environment-target classification:** local-target = N/A (no local
  backend); this project only ever has a hosted-target env, and the
  dev-vs-production distinction is *which Supabase project* the URL points
  at, not local-vs-hosted. Dev project: `course-advisor-dev`
  (`btxkqubctkjhfkunpdfi`, `us-east-1`).
- **Canonical invocation path:** repo root (the app lives there — Q1).
- **Env re-derivation command:** `npx vercel env pull .env.local` — pulls
  Development-scoped vars from Vercel's host env store into the local file.
  Production/Preview vars are set the same way (`vercel env add <NAME>
  <environment>`, value entered interactively, never via a flag/echo) but are
  not pulled locally.
- **Env name-check command:** `scripts/check-env.sh` — reports which of
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` resolve (host env store via `vercel env ls`, or
  `.env.local`) by **name only** — never prints values. Proven green at
  provision for the first two; `SUPABASE_SERVICE_ROLE_KEY` is set by the user
  directly (see the known-failure-signature table below).
- **Known-failure-signature table:**
  - "Supabase 401 on a seeded request → dev project's service-role key
    rotated/missing; re-derive env via `npx vercel env pull .env.local` after
    confirming it's set (`scripts/check-env.sh`)."
  - "`check-env.sh` reports `SUPABASE_SERVICE_ROLE_KEY` missing → the user
    hasn't set it yet, or it needs rotating; direct them to the Supabase
    dashboard (Settings → API Keys) to regenerate, then `vercel env add
    SUPABASE_SERVICE_ROLE_KEY <environment>` themselves, in their own
    terminal. **Never run `supabase projects api-keys` to fetch it** — that
    command prints the secret key value to stdout, which is exactly the
    exposure this rule exists to prevent (hit once during this project's own
    provisioning; the key was rotated immediately after)."
- **Fragile-gate preflight scripts:** none identified yet — added as
  discovered, per gate.
- **Per-suite duration budgets:** static tier proven at provision
  (`npx tsc --noEmit` ~2s, `npx eslint .` ~1s, `next build` ~3-15s cold).
  Unit tier (`npm test` — Vitest) scaffolded ahead of feature #1's M1/M2
  build (to avoid both milestones independently touching `package.json`/
  `vitest.config.ts` and colliding) — proven green with a smoke test,
  ~0.6s cold; expect this to grow as M1/M2 add real suites, revise the
  budget once they land. Component-render/e2e runners remain the scaffold
  gap, closed when `m3-upload-flow` needs them.

## Q13 — Parallel-session (worktree) isolation contract

Not provided — runtime-proof stays serial. A solo/small-project scale
doesn't justify a per-instance Supabase branch/container recipe yet; revisit
if concurrent build sessions become common.

## Q14 — Verification-integrity contract

- **Service-config paths:** `.env.local`, `next.config.ts`,
  `supabase/config.toml` (once created). A dirty tree at these paths means
  the running dev server reflects something other than committed code —
  classified environment, not a code defect.
- **Positive-control probe:** restart `next dev`, then request a route whose
  rendered content includes something that only changes on a genuine reload
  (e.g. a build/request id, or a specific fixture value seeded fresh) —
  never trust the dev-server startup banner alone as proof of a live reload.
