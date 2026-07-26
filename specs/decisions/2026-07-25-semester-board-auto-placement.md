# 2026-07-25 — Semester board auto-distributes placement and starts at the current semester

The original build prompt (`course-advisor-build-prompt.md`) specified a
fixed 8-semester board (all 4 years, past + future) with completed courses
pre-placed in locked past columns, and still-needed courses starting in an
unassigned tray requiring fully manual drag placement — explicitly "NOT
auto-assigning courses to terms in v1."

**Decision:** during the kickoff interview, the user changed this. The board
now: (1) determines the student's current semester (parsed from the PDF
where unambiguous, asked directly otherwise) and shows columns running
forward from there through graduation, not a fixed date-anchored 8-column
range; (2) moves completed courses into a separate Completed list rather
than locked historical columns; (3) auto-distributes (randomly) still-needed
courses across the remaining semester slots as a starting placement, which
the student then rearranges via the same drag-and-drop mechanics.

**Why:** the user's explicit correction, given when confirming the kickoff
synthesis — an empty tray requiring fully manual placement was judged worse
UX than a reasonable starting distribution the student edits.

**Rejected:** the original tray-only/manual-only approach, and a fixed
1-8 semester range regardless of the student's actual standing.

**Still out of scope:** the placement is *random*, not informed by course
offering schedules, prerequisites, or credit-load balancing beyond filling
slots — see `00-product.md`'s out-of-scope section on term/offering
validation, unchanged by this decision.
