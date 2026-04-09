import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "secondary" | "ghost" | "destructive";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[0.75rem] px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-soft)]": variant === "default",
            "bg-[var(--color-surface-high)] text-[var(--color-text)] hover:bg-[var(--color-surface-low)]": variant === "secondary",
            "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
            "hover:bg-[var(--color-surface-low)]": variant === "ghost",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
