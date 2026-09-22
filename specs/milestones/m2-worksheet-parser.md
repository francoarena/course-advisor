# M2 — Worksheet parser (pure logic)

Feature: `specs/features/pdf-upload-parsing.md`. Parallelizable with M1
(schema) — independent, no shared files. M3 depends on both.

Routing: reasoning-heavy (real-world text parsing against document
variance, not boilerplate).

## Goal

A pure, server-only function library that turns a Franciscan Advising
Worksheet PDF's extracted text into a structured, PII-free result — no
route, no database call, no React. `lib/parser/extract.ts` (PDF bytes →
positioned text via `pdfjs-dist`) and `lib/parser/parse.ts` (text →
structured data) per `01-architecture.md`'s source-root convention.

## What it parses (per `specs/features/pdf-upload-parsing.md` and
`01-architecture.md`'s parsing notes)

- Header/footer boilerplate stripped per page.
- Personal-info block (page 1 only): extract `catalog_year`,
  `classification`, `majors[]`, `minors[]`, `career_hours_earned`,
  `career_gpa` — then discard the block; **name, ID number, address,
  phone, advisor names are never returned by this function, not even
  transiently held past the point of extraction.**
- Requirement-group blocks (header + dotted-leader summary + optional rule
  paragraph + course rows/choice sub-blocks), spanning page breaks where a
  header recurs.
- Course rows, three-valued status: `completed` (`CODE-SECTION Title Grade
  Hours`), `needed` (`CODE Title`), `in_progress` (`CODE-SECTION Title
  (Hours In Progress Term)` — grade absent, `term` captured verbatim).
- Choice-group sub-blocks: label + free-text option list (course codes
  extracted from prose, phrasing varies — "Choose one from: X, Y, or Z.",
  "Choose N: A, B; C, D.", "choose one course from X or Y") + resolution
  (a following course row, of any of the three statuses, resolves it;
  otherwise unresolved). Zero-option requirements (language proficiency
  etc.) parse to a `ChoiceGroup` with an empty `options` array — the
  upload flow (M3) is responsible for rendering that as an info card, not
  this library.
- A completed/in-progress course appearing under more than one requirement
  group produces one `CourseRequirement` record per (group, course) pair —
  never deduped into a single global course record.
- **RequirementGroup.type inference** per the corrected taxonomy in
  `specs/decisions/2026-09-22-requirement-type-taxonomy.md`.
- **Course Totals block** (trailing): `hours_needed`, `hours_earned`,
  `hours_in_progress`, `quality_points_needed`, `quality_points_earned`,
  `gpa_needed`, `gpa_earned`, `count_needed`, `count_earned` — all nine
  numbers.
- **Non-applied coursework** ("Non-applied coursework" heading, a
  failing/withdrawn grade like `F` or `W (UN)`) is recognized (skipped,
  not misparsed as a stray group or malformed row) but **not** included in
  the returned result.
- `detectCurrentSemester(parsed)`: best-effort from `classification` +
  `career_hours_earned` (a heuristic pace estimate); returns a
  `{term, year}` guess **and** a `confident: boolean` flag — never a
  silent guess presented as fact. `confident: false` is what M3's
  disambiguation prompt keys off.
- **Validity gate**: if the document yields zero majors/minors and zero
  requirement groups, the parser throws/returns a typed "not a recognized
  worksheet" error rather than an empty-but-nominally-successful result —
  this is what M3's "doesn't look like a Franciscan Advising Worksheet"
  error state keys off.

## Test fixture (build-time requirement, not spec-time)

The two real sample PDFs used to derive this spec carry real student PII
and are **never** committed (see `01-architecture.md`, `.gitignore`). This
milestone's build must create a **redacted fixture PDF** —
`tests/fixtures/worksheet-sample.pdf` — **a real, synthetic, PII-free PDF**
(not a `.txt` file standing in for one), using a fictional student (e.g.
"Jordan Casey") but reproducing every structural pattern named in this spec
and `01-architecture.md`'s parsing notes: repeating page header/footer
boilerplate, multi-page group continuation (one requirement group's header
recurring at the top of the next page mid-block), all three course-row
statuses, resolved and unresolved choice groups (including a zero-option
one), a course counted under two groups, the Course Totals block, and a
Non-applied coursework section. **It must be a real PDF** so
`lib/parser/extract.ts`'s PDF→text path has committed coverage, not just
`parse.ts`'s text→structured-data path — M3's upload-flow tests need an
actual PDF file to upload, and a `.txt`-only fixture would leave
`extract.ts` with zero committed coverage anywhere in this feature. The
committed unit tests run against this fixture, never against a real
sample.

## Done-conditions

- [auto] Given the redacted fixture, `parse()` returns majors/minors/
  catalog_year/classification exactly matching the fixture's known values,
  and the personal-info fields (name/ID/address/phone/advisors) are absent
  from the returned object entirely (not merely unused — checked by
  asserting the keys don't exist). Committed unit test.
- [auto] Given the fixture, every requirement group is extracted with the
  correct `type` per the taxonomy (including at least one `auxiliary` case
  distinct from `elective`, and the default-to-`auxiliary` fallback
  exercised by an unmatched name). Committed unit test.
- [auto] Given the fixture, course rows parse to the correct status
  (`completed`/`needed`/`in_progress`) with correct fields per status
  (grade+hours for completed, neither for needed, hours+term for
  in_progress with grade absent). Committed unit test.
- [auto] A course appearing under two requirement groups in the fixture
  produces two distinct `CourseRequirement` records, not one deduped
  record. Committed unit test.
- [auto] Choice groups parse correctly for: a resolved-by-completed-course
  case, a resolved-by-in-progress-course case (counts as resolved), an
  unresolved case (options present, no resolution), and a zero-option case
  (empty `options[]`). Committed unit test.
- [auto] The Course Totals block parses to all nine numeric fields matching
  the fixture's known values. Committed unit test.
- [auto] The fixture's Non-applied coursework section produces zero
  `CourseRequirement` records for those rows and does not appear anywhere
  in the returned result. Committed unit test.
- [auto] `detectCurrentSemester` returns `confident: true` with a specific
  term/year for a fixture case engineered to be unambiguous, and
  `confident: false` for a fixture case engineered to be ambiguous (e.g. a
  classification/hours combination that doesn't cleanly map to one term).
  Committed unit test — both cases required in the fixture.
- [auto] A malformed/empty input (no majors, no requirement groups —
  e.g. a random unrelated PDF's extracted text) causes `parse()` to throw
  a typed "not a recognized worksheet" error, never an empty-but-successful
  result. Committed unit test.
- [auto] `extract()` (`lib/parser/extract.ts`), given the redacted fixture
  **PDF file** (raw bytes, not pre-extracted text), returns text output
  that `parse()` successfully consumes end-to-end to the same known values
  asserted by the conditions above — a real PDF-bytes-in, structured-data-out
  test, not a `parse()`-on-text-only test. Committed unit test; this is the
  only condition exercising the `pdfjs-dist` extraction path.
- [auto] A requirement group whose header recurs at the top of the next
  page (the fixture's engineered multi-page continuation case) parses to
  **one** continued group record, not two separate groups with the same
  name. Committed unit test.
- [auto] Page header/footer boilerplate (university name, "Unofficial
  Document," the Code Key legend, page numbers, student
  name/classification footer) never leaks into any parsed field — asserted
  by checking that no requirement-group name, course title, or choice-group
  label in the fixture's parsed result contains boilerplate substrings
  (e.g. "Code Key", "Advising Worksheet", "Page "). Committed unit test.

## Verification

`verification: verifier subagent against this spec's done-conditions.`

No `[runtime]` conditions — this milestone adds no route/screen (Q1/Q2),
pure library code, entirely `[auto]`/unit-tier. Static tier
(`tsc`/`eslint`) already proven at provision; the unit tier (Vitest) is
scaffolded by this milestone if it doesn't already exist yet at build
time (the deliberate scaffold gap noted in `specs/stack-profile.md` Q11).
