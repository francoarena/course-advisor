# 01 — Architecture

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript, React 19.
- **Styling:** Tailwind CSS 4. Component primitives, icon set, motion library:
  see `specs/design.md` (owned by the design-system gate, not here).
- **Drag-and-drop:** `dnd-kit` (`@dnd-kit/core`, `@dnd-kit/sortable`,
  `@dnd-kit/utilities`).
- **PDF parsing:** `pdfjs-dist`, run server-side (upload handler), never in
  the browser — the worksheet contains PII and should never round-trip
  through a client-side parse step.
- **Database + Auth:** Supabase (Postgres + Supabase Auth). Replaces any
  local-file DB / hand-rolled auth. Auth is email + password only — no
  OAuth/SSO, no email verification flow.
- **Hosting:** Vercel. `main` auto-deploys; every PR gets a preview
  deployment.
- **Testing:** Vitest (unit), Playwright (e2e). Component-render tier: see
  `specs/stack-profile.md` Q11 — Next.js's create-command ships no test
  runner at all, so this project adds its own ladder rather than inheriting
  one.

## Data model

See `00-product.md`'s "High-level data shapes" for the entity list at product
altitude. Postgres tables (Supabase), owned by whichever milestone first
creates them — this is the starting shape, refined per-feature:

- `users` — Supabase Auth-managed, not a hand-rolled table.
- `plans` (id, user_id fk, majors text[], minors text[], catalog_year,
  current_semester_term, current_semester_position, created_at, updated_at)
- `requirement_groups` (id, plan_id fk, name, type, hours_needed,
  hours_earned, met boolean)
- `course_requirements` (id, requirement_group_id fk, course_code, title,
  grade nullable, credit_hours, status, placed_semester_id fk nullable,
  offered_terms nullable — reserved, unused)
- `choice_groups` (id, requirement_group_id fk, options jsonb,
  selected_course_code nullable)
- `semesters` (id, plan_id fk, term, position, created_at)

Row-level security (Supabase RLS): every table above is scoped to
`auth.uid() = plans.user_id` (directly or via the `plan_id`/
`requirement_group_id` chain) — a hard invariant, not a per-feature choice.
No student's plan is readable or writable by another student's session.

## Hard invariants

- **PII never persists.** Name, ID number, address, phone, and advisor names
  are read during PDF parsing and discarded before any database write. Only
  what's needed to compute degree progress and render the plan (majors,
  minors, catalog year, course/requirement data, choice-group options) is
  stored.
- **Tenant isolation.** A student can only ever read/write their own plan
  data (RLS, above). This is a milestone that touches auth/tenancy and
  carries `/security-review` as a pre-pin step per the shared verification
  rules.
- **Elective dropdowns never expand beyond the worksheet.** A ChoiceGroup's
  options are exactly what was parsed from that student's PDF for that
  group — never a broader course search.
- **No auto-validation of term offerings.** Nothing in v1 blocks or warns
  based on when a course is actually offered (see 00-product.md out-of-scope).

## PDF parsing — architecture notes

Derived from the real Franciscan worksheet (`Advising Worksheet Unofficial
Document`, 5 pages, sampled during kickoff — the sample itself is a local
reference only, gitignored, never committed, since it carries a real
student's PII). Structural patterns the parser must handle, at
architecture-altitude (the parsing feature's own `spec-feature` session goes
deeper):

- **Repeating boilerplate per page** — a page header (university name,
  "Unofficial Document") and a footer (code-key legend, page number, student
  name/classification) repeat on every page and must be stripped before
  section parsing.
- **A personal-info block on page 1 only** — name, ID number, address,
  phone, advisor names, career hours/GPA, classification (e.g. "Senior"),
  catalog year, majors/minors. This is the one place PII lives; strip it
  immediately after extracting catalog year + majors/minors + classification.
- **Requirement-group blocks repeat this shape:** a header line
  (`<Group Name> (MET|NOT MET)` [optionally + `<n>.00 Hours Needed`]),
  followed by a dotted-leader summary line (`<Group Name>:.......<n>.00 Hours
  Earned`), optionally followed by a rule/description paragraph, followed by
  course rows and/or choice-group sub-blocks.
- **A group can span a page break** — the same group header can recur
  verbatim at the top of the next page mid-block; treat a repeated header as
  a continuation, not a new group.
- **Course row format differs by completion status:**
  - Completed: `CODE-SECTION Title Grade Hours` (e.g.
    `BUS-101-B Introduction to Business A 3.00`) — grade is 1-2 chars
    (`A`, `A-`, `B+`, ...), hours is a trailing decimal.
  - Still needed: `CODE Title` only (e.g. `BUS320 Investments`) — no
    section, no grade, no hours.
- **Choice-group sub-blocks** nest inside a requirement group: a short
  label line, then a description line containing the actual option list in
  free text (`"Choose one from: BUS 205, 206, or 208."`, `"Choose 5: PHL
  113, 211, 212; THE 101, 110, 115."`, `"choose one course from BUS 415 or
  ECO 427"` — phrasing varies, course codes need extracting from prose, not
  a fixed template). If a course row immediately follows, the choice is
  already resolved (that row is the pick); if no course row follows, the
  group is unresolved and becomes the dropdown described in 00-product.md
  feature 4.
- **A choice/requirement can have zero course options** (e.g. a language-
  proficiency requirement) — description text with no course codes at all.
  This becomes an info card, never an empty dropdown.
- **The same completed course can appear under more than one requirement
  group** (double-counting toward two majors, for instance) — see the data
  model note above; do not dedupe into one global course record.
- **A trailing "Course Totals" block** gives an overall summary (hours
  needed/earned, GPA needed/earned, count needed/earned) — a degree-level
  rollup distinct from any single requirement group; useful for a top-level
  progress indicator.
- **Current-semester detection:** the worksheet's `Classification` field
  (Freshman/Sophomore/Junior/Senior) and hours-earned/needed give a rough
  signal but not an exact term position — the parser should attempt a
  best-effort read of catalog year + classification, and the app asks the
  student directly whenever that signal is ambiguous (00-product.md spine
  step 3). Never guess silently.

## Environment contract

| Service | Mode (pre-launch) | Env vars | Provisioned by |
|---|---|---|---|
| Supabase (Postgres + Auth) | test/dev project | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `provision` — dev-dedicated Supabase project |
| Vercel | preview + prod (both test-mode env pre-launch) | (Vercel-managed; no app-level var beyond the above) | `provision` — Vercel project linked to the GitHub repo |

No AI/paid external-API calls in v1 — Q7 (live/external proof) is n/a.

**Test-mode credentials only until launch.** Dev and preview deployments use
the dev Supabase project's test keys. Live keys never enter this environment
before the attended launch event (see `specs/deferrals/`).

## Deploy model

Continuous deployment, single gated go-live:

- `main` auto-deploys to Vercel production (test-mode Supabase project,
  pre-launch — harmless, no real users).
- Every PR gets a Vercel preview deployment — this is the deployed
  verification surface for the runtime walk (Q10).
- **Launch** is the one discrete, attended event where live Supabase
  keys/project replace the dev ones and the real domain is pointed. Nothing
  autonomous crosses it — branch protection on `main` blocks direct pushes,
  and live-mode/deploy-config commands are never allowlisted.

## Repo / CI

- GitHub repo, `main` branch, branch protection: PR required, direct pushes
  blocked, required status checks with require-branches-up-to-date.
- CI jobs (per the declared Q11 ladder once the app is scaffolded): static
  (typecheck + lint), unit (Vitest), component-render (Vitest once the
  browser-mode/testing-library tier is wired), e2e (Playwright) — plus the
  `verified-pin` and `plan-lint` jobs (`scripts/check-verified-pin.sh`,
  `scripts/check-plan.sh`), wired now even though no app code exists yet
  (they no-op cleanly against an empty spec dir).
- `specs/` lands as the first PR, inside the bootstrap window (no milestone
  spec exists yet).
