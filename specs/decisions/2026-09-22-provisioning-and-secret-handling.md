# 2026-09-22 — Provisioning completed; two secret-handling incidents and their fixes

Provisioned Supabase (dev project) and Vercel (hosting) per the environment
contract in `01-architecture.md`.

## What happened

1. **The user pasted a database password into chat** while confirming
   Supabase login. Treated as compromised on sight — never used, stored, or
   echoed. The Supabase project that password almost certainly belonged to
   ("Course Advisor", created first) was deleted outright rather than
   attempting to rotate around it, and provisioning proceeded on a second,
   clean project (`course-advisor-dev`) created via CLI with the user
   entering the password directly in their own terminal.
2. **`supabase projects api-keys --project-ref <ref> -o json` was run
   directly** (by the agent) to fetch the anon/publishable key for env setup.
   This command returns *all* API keys for a project in one call, including
   the `service_role`/secret key — which printed into the agent's own tool
   output and therefore into this session's transcript. The key was treated
   as compromised immediately: the user regenerated it in the Supabase
   dashboard and set the new value directly via `vercel env add
   SUPABASE_SERVICE_ROLE_KEY <environment>` in their own terminal, never
   sharing the value.

## Decision

- **Never run `supabase projects api-keys` (or any command that returns a
  secret/service-role-class key) directly.** Fetch only the specific
  publishable/anon key + URL programmatically (safe, meant to be public); any
  secret-class key is retrieved and set by the user, in their own terminal,
  full stop — recorded in `specs/stack-profile.md` Q12's
  known-failure-signature table so this doesn't have to be relearned.
- **A password or key pasted into chat is compromised the moment it lands
  in the transcript**, regardless of whether it's used. The response is
  always: don't use it, tell the user plainly, and have them rotate/delete
  the resource it belongs to — never try to quietly work around it.

## Also decided this session

- **Port assignment:** `21225` (derived from the project name hash, per
  `specs/stack-profile.md` Q12's port-derivation rule), bound in
  `package.json`'s `dev`/`start` scripts and `.claude/launch.json`.
- **`.claude/settings.json` is now committed** (previously the whole
  `.claude/` directory was gitignored, which was wrong per the provision
  skill's baseline-allowlist step — only `settings.local.json` and
  `launch.json` stay local/gitignored now).
- **No local Supabase Docker stack** — this project talks to the hosted dev
  project directly (already decided in `stack-profile.md` Q12; reconfirmed
  during provisioning, no change).
