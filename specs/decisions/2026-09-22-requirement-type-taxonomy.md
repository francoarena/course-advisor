# 2026-09-22 — RequirementGroup.type: auxiliary reqs are required, not elective

Kickoff's original data model (`00-product.md`) named `RequirementGroup.type`
as one of major/minor/core/elective with no inference rule. Drafting
feature #1's parsing spec, the obvious first-pass rule (anything not
major/minor/core falls into `elective`) would have classified groups like
"Finance Auxiliary Reqs" and "InternatlBus Auxiliary Rq" as elective — they
are not; they're required components tied to a specific major/minor, the
worksheet's own "(NOT MET)"/hours-needed framing treats them exactly like
core/major requirements.

**Decision:** the type taxonomy is `major` | `minor` | `core` | `auxiliary`
(required, tied to a major/minor) | `elective` (only "Electives Count" /
"Free Electives Group" — genuine student choice). A top-level group name
that matches none of the explicit patterns defaults to `auxiliary`, never
`elective`.

**Why:** flagged directly by the user mid-interview — "its important to be
specific about reqs vs electives... its important to be explicit what is
required." Silently downgrading a required component to "elective" would
be a real product bug (a student could read "elective" and deprioritize
something they actually must complete), so the default direction is
required-unless-clearly-elective, not the reverse.
