# Design system — Course Advisor

Decided at the kickoff design-system gate (`app-design-directions`), Phase 3,
after an extra round comparing full archetype spreads and hybridizing two
directions. Reference lineage: **text-only rung** — no design-reference MCP
connected, no user-supplied screenshots; directions were derived from the
domain brief (`design/design-brief.md`) alone.

## Chosen direction: Grid × Board hybrid ("Final")

**Thesis:** every semester, on one screen, always — Grid's structural bet —
rendered with Board's friendly, modern, rounded-and-soft-shadowed visual
language instead of Grid's original flat/utilitarian execution. Franciscan
forest green + gold are the only brand accents; Board's per-requirement-type
multi-hue coding was dropped so the palette stays exactly two colors, as
requested.

**Derived from brief:** the brief's job #1 ("see at a glance which semester
has open slots") — served by Grid's all-columns-visible layout — combined
with the brief's explicit "Monday.com... colorful but clean... polished
consumer product, not a school portal" reference, which Grid's original flat
execution under-served and Board's rounded/soft-elevation execution answers
directly.

### Tokens

| Token | Value | Note |
|---|---|---|
| bg | `#F6F7FB` | |
| surface | `#FFFFFF` | |
| border | `#E3E6EF` | |
| text | `#1B1F2A` | |
| text-muted | `#6E7488` | AA against surface ✓ |
| accent | `#1E4A38` | **Franciscan forest green** — primary brand/interactive color: buttons, links, sparkbar fill, focus rings, current-semester card outline base. |
| accent-soft | `#E7EEEA` | forest-green tint — hover backgrounds, sparkbar track, completed-course chip fill. |
| gold | `#B8912E` | **Franciscan gold** — secondary accent, emphasis only: the "NOW" current-semester pill, bold emphasis numbers in the totals bar, the active step in a progress indicator. Never a large fill, never more than one gold element per screen region. |
| gold-soft | `#F7EFDD` | gold tint — unresolved choice-group card background. |
| success / MET | `#1F8A5F` | deliberately a different hue-lightness from `accent` so brand-green and status-green don't read as the same signal |
| warning / in-progress | `#D99A2B` | |
| danger / NOT MET | `#E2574C` | softened from a harsher red — friendlier, matches the rest of the palette's warmth |

- **Type:** display: **Sora** (headings only — card titles, page titles,
  brand mark) · UI + data: **Public Sans** (body, labels, course codes/hours,
  tabular figures on). Two faces, not Grid's original one — Sora's rounded
  geometric warmth is what makes this read "friendly/modern" instead of
  utilitarian; Public Sans carries all data so nothing sacrifices legibility.
- **Spacing base:** 8px (up from Grid's original 4px — the extra breathing
  room is part of what reads as "friendly" rather than "dense grid"; density
  now comes from showing all columns at once, not from tight spacing).
  **Radius:** 16px on cards/columns, 10-12px on rows/inputs/buttons — Board's
  soft, rounded language, not Grid's original near-zero radius.
  **Depth grammar:** soft elevation (`0 2px 10px rgba(20,30,25,.06)`,
  `0 6px 18px rgba(20,30,25,.10)` on hover) — one consistent shadow recipe,
  applied to every card, column, and table, never a mixed set of recipes.
- **Density:** all remaining semesters still visible simultaneously in a
  fixed equal-width grid (Grid's structural bet, unchanged) — but each
  column is a rounded, shadowed card with ~8-10px internal padding and
  ~40px row height, not Grid's original flat 28-32px rows. The density
  comes from the layout (all columns on screen), not from cramped spacing
  within each column.
- **Hierarchy carriers:** color (forest green = interactive/brand, gold =
  emphasis/current-marker only, status colors = met/not-met/in-progress) +
  depth (the soft-shadow card boundary separates content from the page
  background) are the primary carriers; Sora-vs-Public-Sans size/weight is
  secondary, used for page/card titles vs. body and data.
- **Motion stance:** functional, ~150ms — a gentle hover-lift (translateY +
  shadow growth) on interactive rows/cards, an opacity fade on drop, a
  pulsing dot on an in-progress step. Not Board's full spring-physics drag,
  not Grid's near-instant/no-motion — a middle register that reads as
  responsive and alive without becoming playful/expensive.
- **Interaction-state tokens:** hover = shadow grows to `--shadow-hover` +
  1px lift, background shifts `bg`→`surface` on rows; pressed = scale 0.98;
  focus = 3px `accent`-tinted ring (`rgba(30,74,56,.14)`); disabled = 40%
  opacity, no other change.

### Material palette (front-end libraries — owned here, not by the architecture spec)

| Material | Choice | Chosen against its default |
|---|---|---|
| Icons | Phosphor, "fill"/bold style | not Lucide-everywhere; bold fill reads friendlier than thin-stroke, matching Board's warmth over Grid's utilitarian thin icons |
| Motion + interaction-state tokens | CSS transitions, ~150ms functional stance (hover-lift, opacity fade, a pulsing active-step dot) driven by tokens above | not default/absent motion, and not Board's full spring-physics (judged too playful for a document/records-adjacent tool) |
| Charts / data-viz | the inline sparkbar per semester-column header (Grid's signature element, kept), forest green fill on an `accent-soft` track, rounded ends | not stock Recharts |
| Component primitives | shadcn/Radix, retextured to the 16px-radius + soft-elevation system; pill-shaped status/choice badges | not stock shadcn styling (zinc palette, default radius/shadow) |

### Layout architecture

Top nav (brand mark in forest green + a degree-totals bar, gold-emphasized
numbers). Below it, a Completed-courses strip as horizontally-scrollable
pill chips (not a full column). Below that, a full-width fixed grid of all
remaining semester columns as rounded, soft-shadowed cards, equal width, no
scroll on desktop ≥1440px. The current semester's column carries a gold
ring/outline + a gold "NOW" pill under its title — the one placement marker
in an otherwise uniform grid.

### Signature element

The inline sparkbar in every semester-column header, kept from the original
Grid direction — forest green fill, rounded, on every column, the
consistent "how full is this semester" device — now sitting inside a
rounded card instead of a flat bordered box.

### Optimizes for / trades away

- **Optimizes:** the power-scan use case (every semester visible, zero
  clicks to see the whole plan) *and* the "polished consumer product, not a
  school portal" bar from the brief — the combination the pure Grid
  direction didn't fully deliver on its own.
- **Trades away:** slightly more visual weight per column than pure Grid
  (rounded cards + shadows + 8px spacing vs. flat 4px-based rows), so
  fewer semesters may fit per viewport width before horizontal scroll
  kicks in at narrower widths — an acceptable cost for the friendliness
  gained.

### Rejected / superseded directions

- **Pure Grid (flat, 2px radius, no shadow, single-typeface)** — superseded
  by this hybrid; the user liked Grid's *layout* (all semesters visible)
  but not its flat/utilitarian *execution* once seen against Board's
  archetype spread.
- **Pure Board (indigo, functional multi-hue coding, horizontally-scrolling
  kanban lanes)** — its layout was rejected (job #1: seeing all open slots
  at a glance is better served by Grid's structure), but its *visual
  language* (rounded corners, soft elevation, Sora display face, gentle
  motion) was adopted wholesale into this hybrid. Its multi-hue
  requirement-type color-coding was dropped in favor of forest green + gold
  as the only two brand colors, per explicit instruction.
- **Ledger** (worksheet-as-document, mono/serif, registrar stamps) — lost
  in the first round; its domain-derived Franciscan flavor lives on only
  through the forest-green + gold correction, not its document vocabulary.
- **Rail** (calm, one-semester-focus) — lost in the first round; its
  central tradeoff (only one semester ever open) worked directly against
  job #1.

### Interaction/attribute collision check

No two recorded behaviors target the same element/attribute: the
sparkbar's fill width is data-driven only (the hover-lift motion applies to
`.row`/`.col`, a different element, not the sparkbar itself), and the gold
"NOW" pill is a static per-column state, not animated. No collision to
design around.

### Franciscan color correction (recorded for future sessions)

The design brief's Phase 0 question assumed Franciscan's school colors were
navy + gold; they are actually **forest green + gold**. `accent` is
`#1E4A38` (forest green), not navy, throughout this system. Any earlier
reference to "navy" in `design/design-brief.md` or in the archived pure-Grid
mockups is superseded by this correction.
