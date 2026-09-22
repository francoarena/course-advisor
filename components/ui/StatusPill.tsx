import { cn } from "@/lib/cn";

export type StatusTone = "met" | "notmet" | "inprogress";

const toneClasses: Record<StatusTone, string> = {
  met: "bg-success-soft text-success",
  notmet: "bg-danger-soft text-danger",
  inprogress: "bg-warning-soft text-warning",
};

const toneDot: Record<StatusTone, string> = {
  met: "bg-success",
  notmet: "bg-danger",
  inprogress: "bg-warning",
};

export function StatusPill({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 font-ui text-[11px] font-bold tracking-wide",
        toneClasses[tone]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[tone])} />
      {children}
    </span>
  );
}

export function NowPill() {
  return (
    <span className="inline-block rounded-chip bg-gold px-2 py-0.5 font-ui text-[9px] font-bold tracking-wide text-white">
      NOW
    </span>
  );
}
