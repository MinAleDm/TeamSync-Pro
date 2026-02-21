import type { ActivityAction, ActivityEntry } from "@/entities/activity/model/types";
import type { TaskStatus } from "@/entities/task/model/types";
import { STATUS_LABELS } from "@/shared/lib/utils/status";
import { createId } from "@/shared/lib/utils/id";

interface BuildActivityArgs {
  action: ActivityAction;
  userName: string;
  taskId: string;
  projectId: string;
  userId: string;
  taskTitle: string;
  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;
  fromAssignee?: string | null;
  toAssignee?: string | null;
}

export function buildActivityEntry(args: BuildActivityArgs): ActivityEntry {
  const {
    action,
    userName,
    taskId,
    projectId,
    userId,
    taskTitle,
    fromStatus,
    toStatus,
    fromAssignee,
    toAssignee,
  } = args;

  let message = `${userName} updated task \"${taskTitle}\"`;

  if (action === "task_created") {
    message = `${userName} created task \"${taskTitle}\"`;
  }

  if (action === "task_deleted") {
    message = `${userName} deleted task \"${taskTitle}\"`;
  }

  if (action === "task_edited") {
    message = `${userName} edited task \"${taskTitle}\"`;
  }

  if (action === "status_changed" && fromStatus && toStatus) {
    message = `${userName} moved task from ${STATUS_LABELS[fromStatus]} to ${STATUS_LABELS[toStatus]}`;
  }

  if (action === "assignee_changed") {
    message = `${userName} changed assignee from ${fromAssignee ?? "Unassigned"} to ${toAssignee ?? "Unassigned"}`;
  }

  return {
    id: createId("act"),
    taskId,
    projectId,
    userId,
    action,
    message,
    createdAt: new Date().toISOString(),
  };
}
