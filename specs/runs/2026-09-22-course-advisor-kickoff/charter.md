# Kickoff charter — Course Advisor

Kickoff sequence completed 2026-09-22: interview → `spec-foundation` →
`app-design-directions` → `provision`, all merged to `main`, preflight green.
This is the synthesis a `keel:auto run` (or any future session) would
otherwise re-derive from cold.

## What this is

A self-serve academic-advisor replacement for Franciscan University of
Steubenville students. Upload an Advising Worksheet PDF → auto-filled
degree-progress view → drag-and-drop semester planning board, all
semesters visible at once. Monday.com-level polish bar. Non-technical
student audience.

## Resolved backlog + build order

From `specs/00-product.md`, strict order (each depends on the last):

1. **PDF upload & parsing** — pattern-based (section headers, MET/NOT MET,
   hours, choice groups), validated against Franciscan's real worksheet
   format. PII stripped before any DB write, never persisted.
2. **Degree progress view** — majors/minors, catalog year, requirement
   groups with hours needed/earned + met status.
3. **Semester planning board** — columns forward from the student's current
   semester (detected from the PDF where unambiguous, asked directly
   otherwise) through graduation; Completed list separate from the board;
   still-needed courses auto-distributed across remaining slots as a
   starting placement (not a manual-only tray — a mid-interview correction
   from the original build prompt, see `specs/decisions/2026-07-25-semester-board-auto-placement.md`).
4. **Choice/elective dropdowns** — scoped strictly to PDF-listed options.
5. **Accounts & persistence** — email+password (Supabase Auth), re-upload
   merge logic (kept placements for still-needed courses, newly-completed
   move to Completed).

Post-v1 backlog (not built, extension point reserved on the course model):
6. Prereq/schedule-conflict checks.

Out of scope, explicitly: double-major/minor feasibility analyzer,
term-offering validation logic, multi-school worksheet support, admin
panels/config not named above.

## Architecture (specs/01-architecture.md)

Next.js 16 (App Router) + TypeScript + React 19, Tailwind CSS 4, `dnd-kit`,
`pdfjs-dist` (server-side parsing only — PII never touches the client),
Supabase (Postgres + Auth), Vercel (hosting, continuous deployment). RLS is
a hard invariant: every table scoped to `auth.uid()`, carries
`/security-review` as a pre-pin step per the shared verification rules.

## Design (specs/design.md)

Direction: **Grid × Board hybrid** — Grid's all-semesters-visible layout
(the brief's job #1: see all open slots at a glance) rendered with Board's
rounded/soft-elevation friendliness (matching the explicit Monday.com
brief). Palette restricted to **Franciscan forest green (`#1E4A38`) + gold
(`#B8912E`)** as the only two brand accents — corrected mid-session from an
initial wrong assumption that Franciscan's colors were navy. Both light and
dark themes built together from the start. Real workbench live at
`/styleguide` (`app/styleguide/page.tsx`), covering every primitive the
Phase 0 content-type inventory named: buttons, inputs, status pills,
course cards (needed/completed/dragging/empty/choice), semester columns,
upload dropzone + processing states, requirement summaries.

## Provisioned (2026-09-22)

- Supabase: `course-advisor-dev` (`btxkqubctkjhfkunpdfi`, `us-east-1`),
  dev-dedicated, test-mode.
- Vercel: `arena-co/course-advisor`, GitHub-connected. Production:
  `https://course-advisor-five.vercel.app`. Deployment protection off
  pre-launch (see `specs/stack-profile.md` Q10).
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` all resolve (`scripts/check-env.sh` — PASS).
- CI: `plan-lint` + `verified-pin` + `static` (typecheck/lint/build) required
  on `main`. Branch protection live (PR required, direct push blocked).
- Port `21225` (derived from project name), no local Supabase stack (talks
  to the hosted dev project directly).

Two secret-handling incidents occurred and were remediated during this
sitting — full account in
`specs/decisions/2026-09-22-provisioning-and-secret-handling.md`: a
pasted DB password (project deleted, never used) and an agent-run command
that printed a service-role key to its own output (key rotated
immediately). Worth a skim before the next provisioning-adjacent session.

## Definition of done for this run

Kickoff's job was the foundation, the design system, and a green
environment — **not** a milestone list. That's it, and it's done:
`specs/00-product.md`, `01-architecture.md`, `stack-profile.md`,
`design.md`, `decisions/`, `deferrals/`, the real `/styleguide` workbench,
and a provisioned, green-preflight environment are all on `main`.

**No feature milestones exist yet.** The next unit of work is
`spec-feature` on the first backlog item (PDF upload & parsing) — a deep,
attended interview + milestone-authoring session, not something this
charter should pre-decide.

## Suggested next step

When ready to continue building, the next command is:

```
keel:auto run
```

(or, for a single attended feature at a time instead of an unattended
multi-milestone run: invoke `spec-feature` directly for "PDF upload &
parsing," the first backlog item.)

Not issued here — that's the human's call to make, not this session's.
