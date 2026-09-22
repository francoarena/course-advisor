import { cn } from "@/lib/cn";

export function ProgressBar({
  percent,
  className,
  thick = false,
}: {
  percent: number;
  className?: string;
  thick?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-chip bg-accent-soft",
        thick ? "h-1.5" : "h-1",
        className
      )}
    >
      <div
        className="absolute left-0 top-0 h-full rounded-chip bg-accent transition-[width] duration-standard ease-standard"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
