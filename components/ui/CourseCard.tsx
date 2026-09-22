import { cn } from "@/lib/cn";

export interface CourseCardProps {
  code: string;
  title: string;
  hours: string;
  grade?: string;
  dragging?: boolean;
  className?: string;
}

export function CourseCard({ code, title, hours, grade, dragging, className }: CourseCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-control bg-bg px-2.5 py-2",
        "transition-[box-shadow,transform,opacity] duration-standard ease-standard",
        "hover:-translate-y-px hover:bg-surface hover:shadow-card-hover hover:cursor-grab active:cursor-grabbing",
        dragging && "opacity-50 shadow-card-hover",
        className
      )}
    >
      <div className="min-w-0">
        <div className="font-ui text-[10.5px] font-semibold text-text-muted">{code}</div>
        <div className="truncate font-ui text-[11.5px] font-medium text-text">{title}</div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 font-ui text-[10.5px] text-text-muted">
        {grade && <span className="font-bold text-success">{grade}</span>}
        <span>{hours}</span>
      </div>
    </div>
  );
}

export function EmptySlot() {
  return (
    <div className="rounded-control border-[1.5px] border-dashed border-border px-2.5 py-2.5 text-center font-ui text-[10.5px] text-text-muted">
      Empty
    </div>
  );
}

export function ChoiceSlot({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div className="rounded-control bg-gold-soft px-2.5 py-2">
      <div className="mb-1.5 font-ui text-[9.5px] font-bold tracking-wide text-gold-strong">
        {label}
      </div>
      <select
        className={cn(
          "w-full rounded-md border border-border bg-surface px-1.5 py-1 font-ui text-[11px] text-text",
          "focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus-ring"
        )}
        defaultValue=""
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
