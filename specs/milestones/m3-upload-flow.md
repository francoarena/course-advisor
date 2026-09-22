# M3 — Upload flow (UI + integration)

Feature: `specs/features/pdf-upload-parsing.md`. Depends on M1 (schema) and
M2 (parser) — both must be merged and verified before this branches.

Routing: mechanical (primarily wiring already-decided pieces together —
existing workbench primitives, M2's parser, M1's schema).

## Goal

`app/upload/page.tsx` + `app/api/upload/route.ts`: the real, themed upload
experience — drop/select a worksheet PDF, see it parse, land on a success
summary (or a clear error), with the current-semester disambiguation
prompt when M2's detector isn't confident. First writer of `plans` /
`requirement_groups` / `course_requirements` / `choice_groups` via M1's
schema, under a freshly-created anonymous Supabase session.

## Workbench composition (fidelity reference — named in `specs/features/pdf-upload-parsing.md`, not rebuilt here)

Every screen below points at the exact components section in the feature
spec's "Workbench composition" — that section, not prose here, is the
fidelity reference a verifier diffs against. Summary: `UploadDropzone`,
`ProcessingSteps` (extended with a prepended "Uploading…" step),
`Card`, `Button`, `StatusPill`, `ChoiceSlot`'s `<select>` pattern, and a
new `in_progress` variant added to `CourseCard` in the `/styleguide`
gallery in this same milestone (content-grain rule — the primitive is
added where it's first needed).

## Done-conditions

**Logic / invariants**

- [auto] `POST /api/upload` rejects a non-PDF content-type with 415 and a
  PDF over 15MB with 413, before any parsing is attempted. Committed test
  (API-route-level, per the stack profile's Q4 action→effect pattern).
- [auto] A successful upload+parse creates exactly one `plans` row, one
  `requirement_groups` row per parsed group, one `course_requirements` row
  per parsed course (respecting the multi-group-membership rule from M2),
  and one `choice_groups` row per parsed choice group — all correctly
  linked by foreign key, all scoped to the session's `auth.uid()`.
  Committed test, using M2's redacted fixture as the upload payload and
  M1's tenant-isolation test's seeding pattern to create the session.
- [auto] Calling `app/api/upload/route.ts`'s own sign-in path (not M1's
  admin-API test seeding — this route's actual `signInAnonymously()` call)
  produces a session with `is_anonymous: true`, and a subsequent write
  through that same session succeeds under M1's RLS policies. Committed
  test, in this milestone (`app/api/upload/route.test.ts` or equivalent) —
  M1's tenant-isolation test seeds sessions via the admin API and never
  exercises this route's own sign-in code path, so it cannot stand in for
  this condition; this test is new, though it may reuse M1's assertion
  helpers.
- [runtime] The upload API route, invoked against a real (redacted-fixture)
  PDF file on both the dev and production build, actually writes rows
  visible in the dev Supabase project matching the fixture's known parsed
  values — not just a 200 response. Deterministic core covered by the
  committed test above; the runtime walk confirms it against the real
  deployed/dev-server path, not an in-process test double.

**UX completeness**

- [auto] Every state named in the feature spec's workbench composition
  renders with the exact composition named there: empty/first-run, file
  selected, uploading, parsing (5-step sequence including the prepended
  "Uploading…" step), ambiguous-semester prompt, success, and each named
  error case (wrong file type, too large, network failure, unrecognized
  document). Component-render tests (one per state) — deterministic
  interaction/render bugs belong here, not the runtime walk.
- [auto] Drag-and-drop, click-to-browse, and remove/replace-before-submit
  all work and are keyboard-operable (the dropzone is focusable; Enter/Space
  opens the file picker) — component-render test asserting focus order +
  keyboard activation, per the stack profile's Q8.6 accessibility floor.
- [auto] "Try again" on any error state returns to the empty/first-run
  state, not a stuck error screen. Component-render test.
- [runtime] The full happy path — drop the redacted fixture PDF, watch it
  parse, land on the success summary with correct counts (majors, minors,
  requirement groups, courses split completed/needed/in_progress) — works
  end-to-end against a real running server (dev and production build).
  Deterministic core covered by the component-render tests above plus the
  API-route test; this condition is the live, wired-together confirmation
  those pieces actually compose correctly.
- [auto] The ambiguous-semester disambiguation prompt renders when M2's
  detector returns `confident: false` (using the fixture variant engineered
  for this, per M2's done-conditions), and selecting an option + confirming
  submits that value and completes the upload — a deterministic interaction,
  not exploratory. Component-render test.

**Fidelity**

- [runtime] Every screen uses `specs/design.md`'s tokens (forest green +
  gold only, no raw hex values bypassing the semantic tier), the Sora/
  Public Sans font pairing, and matches the named workbench composition in
  `specs/features/pdf-upload-parsing.md` — the vision/fidelity diff
  screenshots each state and compares against that named reference.
  **Specifically checks `design.md`'s gold-restraint rule** ("never a large
  fill, never more than one gold element per screen region"): the only gold
  element in this feature is `ProcessingSteps`' active-step dot (one at a
  time, by construction — `step.state === "active"`), and the
  `in_progress` `CourseCard`/`StatusPill` states use the `warning` token
  (amber), a distinct token from `gold` — the fidelity check confirms these
  aren't conflated into two simultaneous gold elements on the parsing
  screen.
- [runtime] The new `CourseCard` `in_progress` variant, once added to the
  `/styleguide` gallery by this milestone, is itself included in that
  gallery's fidelity check (tokens, not a stray color) — not just
  wherever it's used inside the upload flow. Deterministic core covered by
  a component-render test (`components/ui/CourseCard.test.tsx` or
  equivalent, added by this milestone) asserting the `in_progress` variant
  renders the amber `StatusPill`-style indicator with no grade slot; the
  runtime walk's screenshot confirms the gallery instance visually matches.
- [runtime] Motion: the ambiguous-semester prompt and error states use the
  design system's functional ~150ms transitions (per `specs/design.md`'s
  motion stance), reduce-motion respected (already structural at the token
  layer, per `app/globals.css` — this condition confirms the upload flow
  doesn't bypass it with inline styles).

## Verification

`verification: verifier subagent against this spec's done-conditions, plus
the runtime walk (dev + production build) per the shared milestone rules
§3, plus /security-review pre-pin (this milestone creates auth sessions
and writes tenant-scoped data for the first time in application code,
even though the RLS invariant itself was verified in M1) before the
verified: record is written.`

Stop point: none identified — no live/paid spend, Supabase anonymous auth
and the dev project are already provisioned and allowlisted.
