import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-[22px] font-bold text-text">Course Advisor</h1>
      <p className="max-w-sm font-ui text-[13.5px] text-text-muted">
        Feature routes (upload, plan, login) land per the per-feature build loop. For now, see
        the design system:
      </p>
      <Link
        href="/styleguide"
        className="font-ui text-[13.5px] font-semibold text-accent hover:underline"
      >
        View the styleguide →
      </Link>
    </main>
  );
}
