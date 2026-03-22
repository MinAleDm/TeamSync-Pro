import type { PropsWithChildren } from "react";
import clsx from "clsx";

interface BadgeProps extends PropsWithChildren {
  tone?: "neutral" | "success" | "warning" | "danger";
}

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", {
        "bg-muted text-text": tone === "neutral",
        "bg-emerald-100 text-emerald-700": tone === "success",
        "bg-amber-100 text-amber-700": tone === "warning",
        "bg-rose-100 text-rose-700": tone === "danger",
      })}
    >
      {children}
    </span>
  );
}
