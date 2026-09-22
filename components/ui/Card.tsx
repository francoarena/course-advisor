import { cn } from "@/lib/cn";

export function Card({
  className,
  current,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { current?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card bg-surface p-3.5 shadow-card transition-shadow duration-standard ease-standard",
        current && "shadow-[var(--shadow-card),0_0_0_2px_var(--color-gold)]",
        className
      )}
      {...props}
    />
  );
}
