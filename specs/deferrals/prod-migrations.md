**Deferred:** applying accumulated Supabase migrations to the production
project. Migrations run against the dev project as they're authored;
production has no schema at all until launch.

**From:** kickoff (`01-architecture.md` deploy model).

**Closes when:** at the attended launch event, every migration under
`supabase/migrations/` is applied to the production Supabase project before
the domain is pointed at it.
