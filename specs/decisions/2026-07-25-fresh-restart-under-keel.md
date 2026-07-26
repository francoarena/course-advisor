# 2026-07-25 — Fresh restart under keel, prior prototype archived

A working prototype of this app already existed (`course-advisor/`, Next.js +
better-sqlite3 + bcryptjs, one "Initial commit", no `specs/`, built ad hoc
outside any spec/verification process) at the same path this project now
occupies. It implemented the same v1 scope described in
`course-advisor-build-prompt.md`.

**Decision:** rather than retrofitting specs onto the existing code, the
prototype was archived at `course-advisor-legacy/` (renamed, git history
intact, not deleted) and the project restarted under `keel` from a fresh
interview. Rejected alternative: writing specs to match the existing app
as-is — rejected because the user explicitly chose a fresh restart when
asked, and because the semester-board behavior changed materially during the
interview (see below), so the old implementation wouldn't have matched the
new spec anyway.

**Why:** the user's choice, given during kickoff, when presented with the
option to retrofit specs onto the existing app vs. restart clean.

`course-advisor-legacy/` is excluded from this repo's git tracking
(`.gitignore`) since it carries its own separate git history — it remains on
disk as a local reference only, not a dependency of anything built going
forward.
