# M1 — Worksheet database schema + RLS

Feature: `specs/features/pdf-upload-parsing.md`. Parallelizable with M2
(worksheet parser) — independent, no shared files. M3 depends on both.

Routing: reasoning-heavy (RLS correctness is subtle and security-critical;
gets the higher build/verify effort floor).

## Goal

Create the Supabase tables + row-level security policies feature #1 (and
its successors) need: `plans`, `requirement_groups`, `course_requirements`,
`choice_groups`. Every row traces to exactly one `auth.uid()` and is
invisible/unwritable to any other user — including another anonymous
session.

## Schema

```sql
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  majors text[] not null default '{}',
  minors text[] not null default '{}',
  catalog_year int,
  classification text,
  current_semester_term text,
  current_semester_year int,
  hours_needed numeric,
  hours_earned numeric,
  hours_in_progress numeric,
  quality_points_needed numeric,
  quality_points_earned numeric,
  gpa_needed numeric,
  gpa_earned numeric,
  count_needed int,
  count_earned int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.requirement_groups (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  name text not null,
  type text not null check (type in ('major','minor','core','auxiliary','elective')),
  hours_needed numeric,
  hours_earned numeric,
  met boolean not null default false,
  sort_order int not null default 0
);

create table if not exists public.course_requirements (
  id uuid primary key default gen_random_uuid(),
  requirement_group_id uuid not null references public.requirement_groups(id) on delete cascade,
  course_code text not null,
  title text not null,
  grade text,
  credit_hours numeric,
  status text not null check (status in ('completed','needed','in_progress')),
  term text,
  offered_terms text[],
  sort_order int not null default 0
);

create table if not exists public.choice_groups (
  id uuid primary key default gen_random_uuid(),
  requirement_group_id uuid not null references public.requirement_groups(id) on delete cascade,
  label text not null,
  options jsonb not null default '[]',
  selected_course_code text,
  sort_order int not null default 0
);
```

RLS: enabled on all four tables. `plans` policy checks `user_id =
auth.uid()` directly; the other three check ownership via a join back to
`plans` through their parent FK (`requirement_groups` → `plans`;
`course_requirements`/`choice_groups` → `requirement_groups` →
`plans`). All four get `select`/`insert`/`update`/`delete` policies scoped
this way — a student's anonymous session can fully manage their own plan
and nothing else.

`placed_semester_id` (course_requirements) and the `semesters` table are
**not** created here — that's feature #3's (semester board) migration to
add, when it exists. This migration creates only what feature #1 needs.

Migration file created via `supabase migration new create_worksheet_schema`
(collision-free timestamp naming per `01-architecture.md`'s versioning
rule) — never a hand-numbered file.

## Done-conditions

- [auto] Running every migration against a fresh dev-project-equivalent
  database creates all four tables with the columns/types/constraints
  above; a committed test (`lib/db/schema.test.ts` or equivalent, run
  against Supabase's local/ephemeral test path per the stack profile)
  asserts each table + its `check` constraints exist.
- [auto] RLS is enabled on all four tables (`select relrowsecurity from
  pg_class where relname in (...)` or Supabase's equivalent introspection),
  asserted by a committed test.
- [auto] **Tenant isolation, the hard invariant**: a committed test seeds
  two distinct anonymous Supabase sessions (per the stack profile's Q5 seed
  method — the admin API, no human, no email), each inserts a `plans` row
  + a full chain of child rows (one `requirement_group`, one
  `course_requirement`, one `choice_group`), and asserts session A's
  client **cannot** select, update, or delete session B's rows at any of
  the four tables (each returns zero rows / a permission error, never
  session B's data) — and that each session **can** manage its own rows
  fully (insert/select/update/delete all succeed). This is the test named
  by M3's `[runtime]` persistence conditions as their deterministic-core
  coverage.
- [auto] Inserting a `course_requirements` row with a `status` outside
  `('completed','needed','in_progress')`, or a `requirement_groups` row
  with a `type` outside the five-value enum, is rejected by the database
  (constraint violation) — asserted by a committed test, not left to
  application-layer validation alone.

## Verification

`verification: verifier subagent against this spec's done-conditions, plus
/security-review pre-pin (hard invariant: RLS/tenant isolation) per the
shared milestone rules §3/§5 — confirmed findings become regression tests
before the verified: record is written.`

No `[runtime]` conditions — this milestone adds no route/screen/endpoint
(Q1/Q2), only a schema. The tenant-isolation test above is the load-bearing
check and is `[auto]` (committed, runnable headlessly against the dev
Supabase project or an ephemeral equivalent per the stack profile).
