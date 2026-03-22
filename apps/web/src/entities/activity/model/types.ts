export type ActivityAction =
  | "task_created"
  | "task_deleted"
  | "task_edited"
  | "status_changed"
  | "assignee_changed";

export interface ActivityEntry {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  action: ActivityAction;
  message: string;
  createdAt: string;
}
