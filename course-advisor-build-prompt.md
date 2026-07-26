# Course Registration Advisor — Build Spec (v1)

## Context
My university has no academic advisors. Students are on their own to figure out
which classes they still need and when to take them. I'm building a web app to
fix this.

## Users
College students at Franciscan University of Steubenville. Not technical. Needs
to feel as easy and intuitive as Monday.com — clean, card-based, minimal, fast,
zero learning curve. No clutter, no dense forms, no jargon on screen.

## v1 Scope

### Step 1: PDF Upload → Auto-Filled Degree Progress
The school provides students an "Advising Worksheet" PDF (unofficial degree
audit) that already contains everything needed: declared major(s)/minor(s),
catalog year, and a full breakdown of requirement groups showing which courses
are met (with grade + credit hours) and which are not yet met.

Flow:
1. Student uploads their Advising Worksheet PDF.
2. App parses it and auto-populates:
   - Declared major(s) and minor(s)
   - Every requirement group (e.g. "Finance Major", "BS Core",
     "Ind Org PSY Minor") with hours needed vs. hours earned
   - Courses already completed (with grade) vs. still required
   - "Choose one from X, Y, Z" style requirement groups

### Step 2: Editable Semester Planning Board
This is the core interactive feature. After auto-fill, show a board of
semester columns: Fall/Spring, 8 semesters total (4 years). Each semester
column has 6 course slots by default, with an "add slot" option if a student
needs to overload a semester.

- Already-completed courses are pre-placed in past semesters (read from the
  PDF), locked/greyed out as historical record — not draggable.
- Still-needed courses start in an "unassigned / still needed" tray.
- Student drags courses from the tray into semester slots to build their own
  plan — this is manual, student-driven. We are NOT auto-assigning courses to
  terms in v1 (no data on when things are offered yet — see Deferred section).
- Once talked to their advisor and they know when a class is actually
  offered, the student rearranges cards between semester columns themselves.
- Empty slots are just empty — no placeholder text needed beyond something
  like "+ Add course".

### Step 3: Elective / Choice Requirement Dropdowns
Where the PDF shows a "choose one from A, B, C" style requirement group,
render that requirement as a dropdown containing ONLY the exact options
listed in the PDF for that group — not a free search across all courses.
Once the student picks one from the dropdown, it becomes a normal draggable
course card they can place into a semester slot like any other requirement.

### Explicitly OUT of scope for v1
- Do NOT build a double-major / add-a-minor feasibility analyzer. Cut entirely.
- Do NOT auto-determine which term each missing class is offered, and do NOT
  validate whether a student's manual placement is realistic (e.g. don't warn
  "this class isn't offered in spring") — v1 has no offering-schedule data.
  Leave a clear extension point on the course model (e.g. an optional
  `offered_terms` field) for this to be added later, but build no logic or
  UI around it now.

## PDF parsing — build for variance, not just one document
This worksheet's exact layout will vary by student (different majors, minors,
elective groups, language requirements, "choose one from" blocks). Parse for
the general *pattern*, not by hardcoding to one sample document:
- Section headers with MET/NOT MET status and hours needed/earned
- Row-level entries: course code, title, grade, credit hours (may be blank
  if not yet completed)
- Nested "choose one/some from [list]" sub-requirement groups
- Ignore/strip personal identifying fields (name, ID number, address, phone)
  after parsing — do not persist them. Only store what's needed to compute
  degree progress and render the plan (majors, minors, catalog year, course
  requirement status, choice-group options).

## Accounts
Simple login (email + password) so students can save their plan and
re-upload an updated worksheet later without losing their manual semester
placements. Don't over-engineer auth — no SSO, no OAuth, no email
verification flow unless trivially easy.

## Design direction
Monday.com as the reference point: colorful but clean, card/board-style
layout, drag-and-drop that feels smooth and satisfying, generous whitespace,
minimal text per screen. This should feel like a polished consumer product,
not a school portal.

## Explicit constraints (don't do these)
- Don't build the double-major feature — it's cut, not deferred-in-UI.
- Don't build term/offering validation logic — just note the extension point.
- Don't let elective dropdowns include courses beyond what the PDF lists.
- Don't add abstractions, config options, or admin panels I didn't ask for.
- Don't add error handling/validation for cases that can't happen.
- Do write your own tests to verify PDF parsing, the drag-and-drop board,
  and the elective dropdowns all work correctly before calling this done.

## Deliverable
A working web app I can run locally: upload a real Advising Worksheet PDF,
see it parsed into a semester-by-semester planning board with completed
courses pre-placed, remaining requirements in a tray I can drag into open
slots, and elective requirements shown as dropdowns limited to their listed
options.
