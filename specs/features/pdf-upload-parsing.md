# Feature: PDF upload and parsing

Backlog item #1 in `specs/00-product.md`. First feature spec'd since kickoff.

`flow research:` skipped — no design-reference MCP connected this session;
findings below come from two real Franciscan Advising Worksheet PDF samples
(the original kickoff sample plus a newer one supplied for this session,
both real student PII, neither committed — see `specs/01-architecture.md`'s
parsing notes and the additions below) and the existing `/styleguide`
gallery.

## Feature definition

Takes a Franciscan Advising Worksheet PDF, validates it's parseable,
extracts majors/minors/catalog year/classification (discarding all other
PII immediately), walks the document's requirement-group structure into
`RequirementGroup` + `CourseRequirement` (three-valued status:
completed/needed/in_progress) + `ChoiceGroup` records, parses the trailing
Course Totals block into plan-level summary numbers, determines the
student's current semester (best-effort from the parsed data, falling back
to asking directly), persists everything under a freshly-created anonymous
Supabase session (accounts, backlog #5, don't exist yet — see the decision
below), and ends on a lightweight success summary — not the full progress
dashboard, which is feature #2's job.

## Resolved decisions (this session's interview)

- **Auth bridge:** Supabase anonymous auth. First upload signs the student
  in anonymously (`supabase.auth.signInAnonymously()`); all writes go
  through the same RLS-scoped schema real accounts will use. Feature #5
  upgrades the anonymous session to email+password later (Supabase's
  `updateUser`/identity-linking path) — no data migration needed. Recorded
  as a decision, not just a spec note: see
  `specs/decisions/2026-09-22-anonymous-auth-bridge.md`.
- **Current-semester detection lives in this feature**, not the board
  feature — the natural conclusion of the upload pipeline. Best-effort
  parse-time detection (from `Classification` + hours-earned/needed), with
  a disambiguation prompt when ambiguous.
- **In-progress courses get their own status value** (`in_progress`),
  distinct from `completed` and `needed` — not folded into either.
- **Failed/withdrawn ("non-applied") coursework is skipped for v1** — not
  named in `00-product.md`, parsed past but never persisted.
- **RequirementGroup.type taxonomy corrected mid-interview:** `major` |
  `minor` | `core` | `auxiliary` (required, tied to a major/minor — e.g.
  "Finance Auxiliary Reqs" — must never be lumped into `elective`) |
  `elective` (only "Electives Count" / "Free Electives Group" — genuine
  student choice). An unmatched top-level group name defaults to
  `auxiliary`, never `elective` — required-by-default is the safer
  misclassification. See `specs/decisions/2026-09-22-requirement-type-taxonomy.md`.

## Parsing structural patterns (both real samples)

Extends `specs/01-architecture.md`'s "PDF parsing — architecture notes"
section (that section covers the original sample only; this is the delta
from the second sample):

- **Course-row status is three-valued:**
  - `completed`: `CODE-SECTION Title Grade Hours` (e.g. `BUS-101-B
    Introduction to Business A 3.00`).
  - `needed`: `CODE Title` only, no section/grade/hours (e.g. `BUS420
    Strategic Management`).
  - `in_progress`: `CODE-SECTION Title (Hours In Progress Term)` — a
    section like `completed`, but no grade, and hours+status+term are
    parenthetical (e.g. `BUS-308-OL-A Quantitative Mgmnt Decision Making
    (3.00 In Progress Fall 2026)`, `ACC-304-HY-B Intermediate Accounting I
    (4.00 In Progress Fall 2026)`). The term string inside the parens is
    stored verbatim on `course_requirements.term`.
- **Course Totals block** (trailing, every document) now also carries
  `Hours In Progress: <n>` alongside Hours Needed/Earned, Quality Points
  Needed/Earned, GPA Needed/Earned, Count Needed/Earned — all six numbers
  parsed onto `plans` (new columns, this feature's migration — see M1).
- **RequirementGroup type inference** (the corrected taxonomy above):
  match against the group's header name — `Major`/`Primary AIM: … Major` →
  `major`; contains `Minor` → `minor`; is/contains `Core` → `core`;
  contains `Auxiliary`/`Aux` → `auxiliary`; contains `Elective` →
  `elective`; anything else → `auxiliary` (default-to-required).
- **A choice group resolved by an in-progress course still counts as
  resolved** (the student already enrolled in that pick) — same handling
  as a resolved-by-completed-course choice group.
- **Non-applied coursework** (a "Non-applied coursework" heading, standalone
  rows with a failing/withdrawn grade like `F` or `W (UN)`) is recognized
  by the parser (so it doesn't get misread as a stray requirement group or
  a malformed course row) but is **not persisted** — skipped per the
  resolved decision above.
- PII handling unchanged from `01-architecture.md`: only Classification,
  Catalog Year, Majors, Minors, Career Hours Earned, Career GPA survive
  from the personal-info block; Name, ID Number, Address, Phone, Advisor
  names are read and discarded before any DB write, never logged.

## Current-semester detection

Best-effort at parse time from `Classification` (Freshman/Sophomore/
Junior/Senior) cross-referenced against `hours_earned` vs. a typical
per-year credit pace — this is a heuristic, not exact (the worksheet
carries no explicit "current term" field). When the heuristic can't narrow
to a single confident term+year, the upload flow (M3) shows a
disambiguation prompt instead of guessing silently. Never guess without
surfacing the guess to the student for at least implicit confirmation on
the success screen (e.g. "Fall 2026 — is that right?" framing is a UX
nicety M3 may add, not a hard requirement of this spec).

## Workbench composition (Movement 2 — pure recomposition, no divergence sketch)

Every content type this feature renders already exists in the `/styleguide`
gallery (`app/styleguide/page.tsx` + `components/ui/*`). No gallery-absent
content type, no novel archetype → no reference pull, no mockup file.

`/upload` screen states, named against the real components:

- **Empty/first-run** → `UploadDropzone` (`components/ui/UploadDropzone.tsx`) as-is.
- **File selected (pre-submit)** → a file-preview row reusing the
  filename+size pattern already inside `ProcessingSteps`'s header, +
  `Button variant="ghost" size="sm"` (remove/replace) + `Button
  variant="primary"` ("Upload & Parse").
- **Uploading + Parsing** → `ProcessingSteps` (`components/ui/UploadDropzone.tsx`),
  extended with one prepended step ("Uploading…") ahead of the existing
  four (`Reading document` → `Extracting majors, minors & catalog year` →
  `Parsing requirement groups…` → `Building your plan`), driven by real
  state transitions instead of the static demo data currently in the
  gallery.
- **Ambiguous current-semester prompt** → `Card` (`components/ui/Card.tsx`)
  + a `ChoiceSlot`-style `<select>` (`components/ui/CourseCard.tsx`'s
  `ChoiceSlot`) offering plausible Term/Year options derived from catalog
  year + `Button variant="primary"` ("Confirm").
- **Success** → `Card` with a plain-language summary (counts: majors,
  minors, requirement groups, courses found, split
  completed/needed/in-progress) + `StatusPill tone="met"`
  (`components/ui/StatusPill.tsx`) "Parsed successfully" + `StatusPill
  tone="inprogress"` for the in-progress count. No "Continue" button to a
  `/progress` route that doesn't exist yet (see the integration seam
  below) — this screen is self-contained for this milestone.
- **Errors** (wrong file type / too large / network failure / "doesn't
  look like a Franciscan Advising Worksheet") → `UploadDropzone` gains an
  error-message slot (same visual pattern as `Input`'s existing `error`
  prop — red text below the affected element) + `Button
  variant="secondary"` ("Try again").
- **New `CourseCard` state** (`components/ui/CourseCard.tsx`): an
  `in_progress` variant — an amber `StatusPill`-style indicator in place of
  the grade slot. An addition to the existing primitive (a new prop value),
  not a new content type — add it to the `/styleguide` gallery in the same
  milestone that first renders it (M3), per the content-grain rule.

**Integration seam named:** feature #2 (Degree progress view) mounts into
or replaces this feature's success screen. Feature #2's own spec must
treat that hand-off explicitly.

## Route → milestone map

| Route / surface | Owning milestone |
|---|---|
| `supabase/migrations/*` (plans, requirement_groups, course_requirements, choice_groups + RLS) | M1 |
| `lib/parser/*` (parse + current-semester detection, pure functions, no route) | M2 |
| `app/upload/page.tsx` | M3 |
| `app/api/upload/route.ts` (anonymous sign-in + file handling + invoke M2 + persist via M1's schema) | M3 |

## Lifecycle

- **Interview + sign-off:** this session, 2026-09-22 (user delegated the
  four open interview questions — "I trust you to make that call" — and
  corrected the type-taxonomy default before sign-off).
- **Composition redline:** this session, 2026-09-22 — pure recomposition,
  waved through (no rendered artifact exists yet to screenshot; named
  components stood in as the reference per Movement 2's pure-recomposition
  path).
- **Plan PR:** opened this session — see the PR this spec ships in.
- **M1 code PR + `verified:` pin:** not yet — future `implement-milestone` run.
- **M2 code PR + `verified:` pin:** not yet.
- **M3 code PR + `verified:` pin:** not yet.
- **Post-wave consolidated check on `main`:** not yet (after M1+M2+M3 all merge).
- **`review-feature` (human aesthetic/completeness gate):** not yet.
