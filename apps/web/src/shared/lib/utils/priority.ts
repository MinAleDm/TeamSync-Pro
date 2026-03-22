import type { TaskPriority } from "@/entities/task/model/types";

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
  medium: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  urgent: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
};
