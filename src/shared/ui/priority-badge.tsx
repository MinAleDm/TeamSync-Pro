import type { TaskPriority } from "@/entities/task/model/types";
import { PRIORITY_LABELS, PRIORITY_STYLES } from "@/shared/lib/utils/priority";

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
