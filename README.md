# Course Advisor

Upload your Franciscan University Advising Worksheet PDF and build a
drag-and-drop semester plan from it. See `specs/00-product.md` for the full
product skeleton and `CLAUDE.md` for how this project is built.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Feature routes (upload, plan, login) land per
the per-feature build loop; for now, `/styleguide` is the design system —
every themed primitive, real code, per `specs/design.md`.

## Stack

Next.js 16 (App Router) + TypeScript + React 19, Tailwind CSS 4, Supabase
(Postgres + Auth), Vercel. Full environment contract in
`specs/01-architecture.md`.
