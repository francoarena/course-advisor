import { Card } from "./Card";
import { ProgressBar } from "./ProgressBar";
import { NowPill } from "./StatusPill";
import { EmptySlot } from "./CourseCard";
import { cn } from "@/lib/cn";

export function SemesterColumn({
  term,
  filled,
  capacity,
  current,
  children,
}: {
  term: string;
  filled: number;
  capacity: number;
  current?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card current={current} className="flex flex-col">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-display text-[13.5px] font-bold text-text">{term}</h3>
        <span className="font-ui text-[11px] font-semibold text-text-muted">
          {filled}/{capacity}
        </span>
      </div>
      {current && <NowPill />}
      <ProgressBar percent={(filled / capacity) * 100} thick className={cn("mb-2.5", current && "mt-2")} />
      <div className="flex flex-col gap-1.5">{children}</div>
      <button
        type="button"
        className="mt-1.5 rounded-control py-1.5 font-ui text-[11px] font-semibold text-accent transition-colors hover:bg-accent-soft"
      >
        + Add slot
      </button>
    </Card>
  );
}

export { EmptySlot };
