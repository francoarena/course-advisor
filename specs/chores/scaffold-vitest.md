# Chore: scaffold Vitest ahead of feature #1's parallel milestones

Punch-list lane (`specs/chores/<slug>.md`) — orchestrator-level infrastructure
prep, not a feature milestone. Done before dispatching `m1-worksheet-schema`
and `m2-worksheet-parser` in parallel, so neither build touches
`package.json`/`vitest.config.ts` and collides with the other (the
shared-file trap the milestone-sizing rules warn about, §4 of
`references/milestones-and-verification.md`).

## What changed

- Installed Vitest + `@vitejs/plugin-react` + `jsdom` + Testing Library
  (`@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`) — bumped `@types/node` to `^24` to resolve
  a peer-dependency conflict with Vitest 5.
- `vitest.config.ts` + `vitest.setup.ts` (jsdom globally — `m3-upload-flow`,
  next in this feature, needs component-render tests too; M1/M2's own
  tests are plain Node-side and unaffected by the jsdom global).
- `npm test` / `npm run test:watch` scripts; a `tests/smoke.test.ts` proving
  the tier actually runs (per the "prove the ladder once" discipline).
- `unit` CI job added alongside `plan-lint`/`verified-pin`/`static`.
- `specs/stack-profile.md` Q12 updated with the proven-green unit tier
  duration.

No application logic — infrastructure only.

## Verification

- `npm run build` — clean.
- `npm test` — `tests/smoke.test.ts` passes.
- CI on the PR: `plan-lint`, `static`, `unit` all green (only
  `verified-pin` failed before this chore spec + pin were added, per the
  pin gate correctly rejecting an unpinned code change once the bootstrap
  window closed).

verified: clean at 519974e, 2026-09-22, via self-verification (trivial
infrastructure scaffold, no application logic — static+unit CI green,
confirmed locally) (evidence in PR #8)
