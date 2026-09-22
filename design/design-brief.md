# Design Brief — Course Registration Advisor

> Produced in Phase 0 of the app-design-directions skill. Confirm with the user before Phase 1.

## Product
- **One sentence:** A self-serve academic-advisor replacement — upload your Advising Worksheet PDF, get an auto-filled degree-progress view, and build your remaining-semesters plan on a drag-and-drop board.
- **Stage:** Pre-code (kickoff just landed the specs; no app scaffolded yet). A prior ad-hoc prototype exists but is archived and not a design input — this is a from-scratch design pass.

## Users & jobs
- **Primary user:** A Franciscan University of Steubenville undergrad, non-technical, using this a handful of times per semester (upload once per term, rearrange the plan occasionally, check progress before registration). Not a daily driver.
- **Secondary viewers:** None load-bearing in v1 — no advisor/parent view, no export/share.
- **Top 3 jobs on the load-bearing screen:**
  1. See at a glance which semester still has open slots and which is already full.
  2. Drag a still-needed course into a semester without losing track of what's already placed elsewhere.
  3. Resolve a "choose one from..." requirement without leaving the board.

## Screens
- **Load-bearing screen (mockup canvas):** the **semester planning board** — columns running forward from the student's current semester, a Completed list, still-needed cards auto-distributed into slots, elective dropdowns inline. The single most data-dense, most-used screen; everything else is a step on the way to it.
- **Other key screens:** sign up / log in, PDF upload (dropzone + processing state), degree-progress summary (majors/minors/requirement groups with hours needed vs. earned — likely a header/sidebar region of the board screen rather than a fully separate page, per the spine journey, but mocked as its own archetype instance since it's structurally a summary/dashboard view).
- **Density classification:** **mixed, leaning card-based-but-data-dense** — not a spreadsheet, but not airy either. Up to 8 semester columns × 6+ slots means real density (a kanban-scale board, not a 3-card marketing flow); the Monday.com reference point is exactly this register: colorful and clean, but a working tool people scan quickly, not a showcase.

## Data & vocabulary
- **Core entities:** Plan, RequirementGroup (major/minor/core/elective), CourseRequirement (completed vs. needed), ChoiceGroup, Semester.
- **Sample real data for mockups** (Franciscan-style course vocabulary, fictional student — never the real sample PDF's PII):
  - Majors: Finance, International Business. Minors: Management, Industrial-Organizational Psychology.
  - Completed: `BUS-307-A Princ of Organization & Management`, A, 3.00 hrs; `ACC-208-C Managerial Accounting`, A, 3.00 hrs; `ECO-201-D Principles of Economics I`, A, 3.00 hrs; `PHL-113-OL-A Philosophy of the Human Person`, A-, 3.00 hrs.
  - Still needed: `BUS420 Strategic Management`; `BUS434 Senior Thesis`; `ACC304 Intermediate Accounting I`.
  - Unresolved choice group: "BUS Law Option — Choose one from: BUS 205, 206, or 208."
  - Requirement group progress: "Finance Major — 30.00 / 42.00 Hours Earned (NOT MET)."
- **Domain artifacts worth drawing from visually:** the worksheet's own MET/NOT MET badge language, hours-needed-vs-earned framing, "choose one from" phrasing — these are the app's real vocabulary and should show up in copy, not generic SaaS labels ("Progress: 60%").
- **Content types:** a draggable course card (code/title/grade/hours, distinct completed-vs-needed visual state); a kanban-style board column (semester, with an add-slot affordance); a requirement-group progress summary (hours needed/earned, met/not-met state — a progress-bar-or-badge primitive, not a generic stat tile); a scoped choice dropdown (options limited to exactly what the worksheet listed); a file-upload dropzone with a processing/parsing state.

## Platform & stack
- **Platform target:** web — from `specs/stack-profile.md` Q8.1 (has UI: yes) / Q8.6 (web conventions: pointer + keyboard, browser-native focus order).
- **Native-feel conventions:** n/a — web target. Note: the drag-and-drop board must have a keyboard-operable equivalent (`dnd-kit`'s keyboard sensor) — an accessibility floor, not a platform-convention question.
- **Platform + stack:** Next.js 16 (App Router) + React 19 + TypeScript; Tailwind CSS 4 for tokens/styling; `dnd-kit` for drag-and-drop (already chosen in `01-architecture.md` — this gate themes it, doesn't replace it).
- **Existing tokens/theme:** none yet — greenfield, no app code exists.
- **Theme support:** both light and dark, built together from the start.

## Constraints
- **Must keep:** none literally mandated (no existing logo), but the palette should nod at Franciscan's navy + gold — subtle flavor for an audience that's exclusively Franciscan students, never a literal reuse of the university's own branding/logo (this stays an unaffiliated, unofficial tool).
- **Accessibility / compliance:** WCAG AA as a floor (non-technical, general student population); keyboard-operable drag-and-drop.
- **User's known taste:** explicit reference given at kickoff — "Monday.com as the reference point: colorful but clean, card/board-style layout, drag-and-drop that feels smooth and satisfying, generous whitespace, minimal text per screen... a polished consumer product, not a school portal."

## Open questions for the user (max 3)
1. **Dark mode:** build both light and dark themes, or light-only for v1?
2. **Color palette independence:** should the palette nod at Franciscan's school colors (navy + gold) since the audience is exclusively Franciscan students, or stay fully independent of any school branding since this isn't an official university product?
