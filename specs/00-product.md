# 00 — Product

## Vision

Franciscan University of Steubenville has no academic advisors. Students are on
their own to figure out which courses they still need and when to take them. The
school already issues an "Advising Worksheet" PDF (an unofficial degree audit)
that contains everything needed to answer that — declared majors/minors, catalog
year, and a full breakdown of requirement groups showing what's met and what
isn't. Nobody turns that PDF into something usable.

This app does: upload the worksheet once, land on an auto-filled degree-progress
view, then build a semester-by-semester plan on a drag-and-drop board — a
self-serve advisor replacement.

## Users

College students at Franciscan University of Steubenville. Not technical. The
bar is Monday.com: colorful but clean, card/board-style, drag-and-drop that
feels smooth and satisfying, generous whitespace, minimal text per screen. A
polished consumer product, not a school portal.

## Jobs to be done

- "Tell me what I still need, without reading a dense PDF."
- "Let me sketch out which semester I'll take each remaining course, without
  forcing me to know the real course schedule up front."
- "Let me rearrange that plan once I actually talk to my advisor or check the
  real course catalog."
- "Let me update my plan next semester without losing what I already arranged."

## Feature backlog (build order)

Spine-journey features first, so early work is a usable walking skeleton. Later
items only start once the ones before them exist, unless marked independent.

1. **PDF upload & parsing.** Student uploads their Advising Worksheet PDF; the
   app parses it for the general *pattern* (section headers, MET/NOT MET status,
   hours needed/earned, row-level course entries, nested "choose one/some from"
   groups) rather than hardcoding to one document. Validated end-to-end against
   Franciscan's real worksheet format for v1 — a different school's layout is
   out of scope until this format is solid. PII (name, ID number, address,
   phone, advisor names) is parsed transiently and never persisted.
2. **Degree progress view.** The parsed result renders as majors/minors,
   catalog year, and every requirement group with hours needed vs. earned and
   met/not-met status — the auto-fill promise made visible before the board.
3. **Semester planning board.** The core interactive feature. Columns run
   forward from the student's current semester through graduation (detected
   from the PDF's classification/hours data where possible; asked directly if
   the worksheet doesn't make it unambiguous). Completed courses live in a
   separate Completed list, not locked columns. Still-needed courses are
   auto-distributed across the remaining semester slots as a starting
   placement; the student drags cards between slots to rearrange. "+ add slot"
   for an overloaded semester.
4. **Choice/elective dropdowns.** Where the worksheet shows a "choose one/some
   from A, B, C" group with no course yet resolving it, render a dropdown
   scoped strictly to the exact options listed for that group — never a free
   search across all courses. Picking one turns it into a normal draggable
   card, subject to the same auto-placement/rearrangement as any other
   still-needed course. A choice group with no listed options at all (e.g. a
   language-proficiency requirement) renders as a plain info card instead.
5. **Accounts & persistence.** Email + password auth (no SSO/OAuth, no email
   verification). A plan persists per account and survives re-upload: when the
   student uploads an updated worksheet, manual placements are kept for
   courses still needed, and newly-completed courses move to the Completed
   list.

**Post-v1 (backlog, not built yet):**

6. **Prereq / schedule-conflict checks.** Warn when a manually-placed course
   has unmet prerequisites, once the course model has enough data to support
   it. The course model reserves an extension point now (an `offered_terms`
   -shaped field) but carries no logic or UI until this feature is actually
   spec'd.

Independent/parallelizable: none of v1's features are independent of each
other — 2 depends on 1, 3 depends on 2, 4 extends 3, 5 wraps all of them. Build
in strict order.

## Spine journey

1. Sign up / log in.
2. Upload Advising Worksheet PDF.
3. App determines the student's current semester (from the PDF if
   unambiguous; asks the student directly if not) before the board renders.
4. Land on auto-filled degree progress: majors/minors, catalog year, every
   requirement group with hours needed vs. earned.
5. Semester planning board renders: columns forward from the current semester
   through graduation; completed courses in a separate Completed list;
   still-needed courses auto-distributed across the remaining slots as a
   starting point.
6. Student drags cards between semester slots to rearrange the plan; "+ add
   slot" for an overloaded semester.
7. "Choose one from A, B, C" groups render as scoped dropdowns; picking an
   option turns it into a normal draggable card.
8. Plan auto-saves.
9. Student can re-upload an updated worksheet later: placements for
   still-needed courses are kept, newly-completed courses move to Completed.

## High-level data shapes

- **User** — auth identity (Supabase Auth).
- **Plan** — belongs to a User. `majors[]`, `minors[]`, `catalog_year`,
  `current_semester` (term + year-position).
- **RequirementGroup** — belongs to a Plan. `name`, `type` (major / minor /
  core / elective), `hours_needed`, `hours_earned`, `met` (boolean).
- **CourseRequirement** — belongs to a RequirementGroup. `course_code`,
  `title`, `grade` (nullable), `credit_hours`, `status` (completed / needed),
  `placed_semester_id` (nullable — null while still in the auto-distribution
  pass has not yet run or the course is unplaced), `offered_terms` (reserved,
  unused in v1). A single completed course can satisfy more than one
  RequirementGroup (the worksheet lists the same course under multiple groups
  when it double-counts) — model this as one CourseRequirement row per
  (RequirementGroup, course) pair, not a single global course record, so
  progress math per group stays correct.
- **ChoiceGroup** — belongs to a RequirementGroup. `options` (CourseOption[]
  parsed verbatim from the worksheet), `selected_course_code` (nullable).
- **Semester** — belongs to a Plan. `term` (Fall/Spring), `position` (relative
  to the student's current semester, not a fixed calendar year), `slots`
  (placed CourseRequirements, in order).

This is a starting shape, not a locked schema — it will migrate as
`spec-feature` sessions deepen each feature.

## Out of scope

- **Double-major/minor feasibility analyzer.** Cut entirely, not deferred.
- **Term/offering validation.** No logic or UI that determines which term a
  missing class is offered, or that validates a student's manual placement
  against a real course-offering schedule. v1 has no offering-schedule data.
  The `offered_terms` field on CourseRequirement is the only extension point
  left for this; no behavior is built around it yet.
- **Multi-school worksheet support.** v1 parses Franciscan's worksheet format
  only. A different school's layout is a later backlog item, not v1.
- **Admin panels, config surfaces, or abstractions not named above.**
- **Live third-party keys in dev.** Dev uses Supabase test-mode resources
  only; live/production keys never enter the dev environment before launch.
