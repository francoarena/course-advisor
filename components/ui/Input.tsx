import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref
) {
  return (
    <div>
      <input
        ref={ref}
        className={cn(
          "w-full rounded-control border bg-surface px-3.5 py-2.5 font-ui text-[13.5px] text-text",
          "transition-[box-shadow,border-color] duration-standard ease-standard",
          "focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus-ring",
          "disabled:cursor-not-allowed disabled:opacity-disabled",
          error ? "border-danger" : "border-border",
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="mt-1.5 text-[11.5px] font-medium text-danger">{error}</p>}
    </div>
  );
});
