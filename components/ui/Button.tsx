import { type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-control font-ui text-[13.5px] font-bold " +
    "transition-[box-shadow,background-color,transform] duration-standard ease-standard " +
    "focus-visible:outline-none focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-disabled " +
    "active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white shadow-[0_4px_14px_rgb(30_74_56_/_0.28)] hover:bg-accent-strong",
        secondary:
          "bg-surface text-text border border-border hover:border-accent hover:bg-accent-soft",
        ghost: "text-accent hover:bg-accent-soft",
      },
      size: {
        md: "px-4 py-2.5",
        sm: "px-3 py-1.5 text-[12px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
