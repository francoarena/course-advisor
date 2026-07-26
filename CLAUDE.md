# Course Registration Advisor

Franciscan University of Steubenville has no academic advisors. This app
turns a student's Advising Worksheet PDF into a self-serve, drag-and-drop
semester-planning board. Non-technical college-student audience; a
Monday.com-level polish bar. See `specs/00-product.md` for the full product
skeleton and `specs/01-architecture.md` for the stack/data model/environment
contract.

## Governing rule

All work is governed by `specs/` — resolve implementation choices in favor
of the spec, and flag conflicts rather than improvising. **Carve-out for
shipped work:** once a milestone's `verified:` pin is on `main`, its merged
code is authoritative — don't rewrite correct merged code to match a stale
spec; the living doc is reconciled to reality instead. "Favor the spec"
governs unbuilt plan, not code history has already overtaken.

## Feedback ladder

Cheapest → dearest (per `specs/stack-profile.md` Q11; commands assume the
app has been scaffolded — the first milestone installs the test runners,
since `create-next-app` ships none):

1. **Static** — `npx tsc --noEmit && npx eslint .` (sub-seconds, incremental)
2. **Unit** — `npx vitest run` (unit project only; ms/test)
3. **Component-render** — `npx vitest run` (component/browser-mode project;
   ~10-1000ms/test) — deterministic interaction bugs (drag-and-drop
   reordering, dropdown selection, focus order) live here, not in e2e.
4. **End-to-end** — `npx playwright test` (seconds/test + server boot;
   reserve for what lower rungs structurally can't see)

**Single-test-first:** in the dev loop, run only the affected test, not the
whole suite. The full suite is required for any verification/proof run or
pin — never a filtered subset there.

**Routing rule:** reproduce and debug at the cheapest rung that can see the
failure class. The runtime walk (Playwright, against both dev and production
builds) is the *gate*, not the debugger — don't hand-drive a browser to
chase something a typecheck or unit test would show in a second.

## Verification approach

A milestone is checked by the verifier subagent (or a dynamic workflow, per
its `verification:` line) against its spec's measurable done-conditions,
tagged `[auto]` / `[runtime]` / `[attended]`. A feature isn't done until its
`review-feature` gate passes on top of that. Full rules:
`${CLAUDE_PLUGIN_ROOT}/references/milestones-and-verification.md`.

## Run preflight (authorization-completeness)

Before a milestone run, confirm every milestone in scope can complete
autonomously:

1. **Services** — one cheap read-only command per service where available
   (e.g. a Supabase project status check), bare env-var-name existence
   otherwise via `specs/stack-profile.md`'s recorded env name-check command
   — never read values, never read `.env*` directly.
2. **Spend/real-resource gates** — any done-condition needing live spend
   must be pre-authorized (a spend-capped key + allowlisted command), not
   gated per-use. (v1 has no paid external calls — Q7 is n/a — so this is
   currently a no-op, re-check if that changes.)
3. **Deferrals** — read `specs/deferrals/`; drain any open item whose
   closing condition falls inside this run's scope.

Surface anything missing/dead/unauthorized in one batch before starting; if
a gate can't be pre-authorized, treat that milestone as a stop point.

## Derived status

Current state is derived, never recorded: read the `verified:` lines in
`specs/milestones/` and `gh pr list`. There is no "current phase" paragraph
to maintain here — it would live on `main` while work advances on branches
and go stale by construction.

## Build start protocol

Before writing code for a milestone: derive state (`verified:` pins + `gh pr
list` + recent `git log`), re-read that milestone's spec +
`specs/stack-profile.md` from `main` (the plan may have moved), run the
profile's Q12 substrate health check (a red substrate is a stop point routed
to its signature-table remedy, never built on), and run the cheapest
committed rung once to confirm a green baseline. A pre-existing red is a
stop point — route to `debug`, never build on top of it. Then branch.

## GitHub process

- One branch + one PR per milestone, named after the slug.
- Checkpoint commits are fine. Independent milestones squash-merge (one
  commit per milestone on `main`). **Stacked milestones merge bottom-up with
  merge commits titled with the slug** — squashing a stacked PR orphans
  descendants' `verified:` records.
- Schema changes use Supabase's timestamp-versioned migrations
  (`supabase migration new <name>`) — never a hand-incremented counter.
  Shared-object migrations are idempotent (`create ... if not exists`).
- Verify + record in stack order, bottom-up — never fork the next milestone
  off unverified code.
- Keep stacks as shallow as the genuine dependency chain requires; prefer
  parallelizable milestones off `main`.
- **A wave isn't done until it's green on `main` together** — after a wave's
  PRs merge, run one consolidated check on `main` (fresh state → all
  migrations → full suite + the consolidated first-run walk for UI waves).
- A conflict-forced rebase with no behavioral diff re-pins via
  `scripts/repin.sh <milestone-spec> [note]` after a green re-run — it
  doesn't re-verify from scratch. A rebase that changed behavior is a new
  state and must be re-verified.
- Before each stacked merge, confirm the PR's base is `main`
  (`gh pr view <n> --json baseRefName`). Never merge with checks pending or
  red. **The user reviews and merges; agents open PRs and merge only on
  explicit per-merge instruction.** After each merge+delete, verify the next
  PR retargeted and is still OPEN (recover with `gh pr edit <n> --base main`
  then `gh pr reopen <n>` if it closed).
- Run `/verify-milestone` in a fresh session before opening the PR. The PR
  body quotes the done-conditions + verification evidence.
- Spec updates and `decisions/`/`deferrals/` entries ride the same milestone
  branch as the work that caused them (file-per-entry — parallel branches
  never collide).
- **Adversarial review runs before the pin**, type chosen by milestone kind:
  invariant/auth/tenancy/data → `/security-review`; algorithmic/logic-heavy
  → `/code-review ultra`. Never pin-then-review.
- A review of a *stacked* PR is blind to its descendants — validate a
  reviewer's "remove this" finding against what's stacked on top before
  acting on it.

## Design system

Once built at the design-system gate, the primitives/tokens/motion live in
`specs/design.md` and the `/styleguide` route (Q8.3) — every feature composes
from there, never invents its own one-off styling.
