import type { TaskPriority, TaskStatus } from "@tracker/types";

export const statusOrder: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  REVIEW: "Review",
  DONE: "Done",
};

export const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const priorityTone: Record<TaskPriority, "neutral" | "success" | "warning" | "danger"> = {
  LOW: "neutral",
  MEDIUM: "success",
  HIGH: "warning",
  URGENT: "danger",
};
