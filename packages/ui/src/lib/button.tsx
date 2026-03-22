import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ children, className, variant = "secondary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-accent/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-accent text-white hover:opacity-90": variant === "primary",
          "border border-border bg-card hover:bg-muted": variant === "secondary",
          "bg-transparent text-text hover:bg-muted/70": variant === "ghost",
          "bg-rose-600 text-white hover:bg-rose-700": variant === "danger",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
