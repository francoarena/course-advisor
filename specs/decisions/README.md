# Decisions

A file-per-entry log of material, cross-cutting decisions and the reasoning
behind them — one `YYYY-MM-DD-<slug>.md` per decision. Parallel branches each
add a file, so they never conflict on a shared append-log.

Don't record what the code or spec already makes obvious. Reserve this for
decisions a future session couldn't reconstruct on its own: architectural
calls, stack choices, scope cuts, and their rejected alternatives.

Update an existing entry rather than adding a contradicting one; on reversal,
strike the entry with a pointer to the superseder.
