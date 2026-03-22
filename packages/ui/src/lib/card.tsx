import type { HTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={clsx("rounded-3xl border border-border bg-card shadow-soft", className)} {...props}>
      {children}
    </div>
  );
}
