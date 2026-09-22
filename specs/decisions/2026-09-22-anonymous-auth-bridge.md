# 2026-09-22 — Anonymous Supabase auth bridges upload/parsing until accounts (feature #5) land

The product backlog builds accounts last (feature #5), but the data model
(`01-architecture.md`) persists everything to Supabase tables scoped by
`auth.uid()` via RLS, and feature #1 (PDF upload & parsing) is being spec'd
now — before any accounts feature exists.

**Decision:** feature #1 signs the student in via Supabase's anonymous auth
(`signInAnonymously()`) on first upload, and all writes go through the real
RLS-scoped schema from day one. Feature #5 later upgrades the anonymous
session to a real email+password identity via Supabase's identity-linking
path — the same `auth.uid()`, no data migration.

**Rejected:** browser-only storage (localStorage/sessionStorage) until
accounts exist. Rejected because it would mean re-parsing or a manual
migration step once accounts land, and the semester-planning board
(feature #3, drag-and-drop persistence) can't be a real multi-device
product on top of browser-only storage — it would need its own rewrite
later anyway.

**Why:** raised during feature #1's interview as a genuine architectural
fork; the user delegated the call ("I trust you to make that call").
Anonymous auth is a well-supported Supabase pattern specifically for this
kind of bridge.
