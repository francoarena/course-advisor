# Deferrals

The tracked list of everything outstanding before production is real —
one `<slug>.md` file per open item, plus `_closed.md` as an archive of
closed items.

Each entry: what's deferred, which milestone/verdict it came from (or
"kickoff" if seeded at spec time), and the condition that closes it.

The run preflight reads this directory: any deferral whose closing condition
falls inside the run's scope is drained before launch. An item is removed
only when its condition is actually met — not when a milestone merely
merges.
