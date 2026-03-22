import type { TaskActivityDto, TaskCommentDto, TaskDetailsDto, TaskDto, UserSummaryDto } from "@tracker/types";

function mapUser(user: { id: string; email: string; name: string; role: "ADMIN" | "USER" }): UserSummaryDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function mapTask(task: {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignee: { id: string; email: string; name: string; role: "ADMIN" | "USER" } | null;
  creator: { id: string; email: string; name: string; role: "ADMIN" | "USER" };
  createdAt: Date;
  updatedAt: Date;
  _count: { comments: number };
}): TaskDto {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee ? mapUser(task.assignee) : null,
    creator: mapUser(task.creator),
    commentsCount: task._count.comments,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function mapComment(comment: {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; email: string; name: string; role: "ADMIN" | "USER" };
}): TaskCommentDto {
  return {
    id: comment.id,
    body: comment.body,
    author: mapUser(comment.author),
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

export function mapActivity(activity: {
  id: string;
  action: string;
  field: string | null;
  beforeValue: string | null;
  afterValue: string | null;
  createdAt: Date;
  actor: { id: string; email: string; name: string; role: "ADMIN" | "USER" };
}): TaskActivityDto {
  return {
    id: activity.id,
    action: activity.action,
    field: activity.field,
    beforeValue: activity.beforeValue,
    afterValue: activity.afterValue,
    actor: mapUser(activity.actor),
    createdAt: activity.createdAt.toISOString(),
  };
}

export function mapTaskDetails(task: {
  comments: Array<{
    id: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    author: { id: string; email: string; name: string; role: "ADMIN" | "USER" };
  }>;
  activities: Array<{
    id: string;
    action: string;
    field: string | null;
    beforeValue: string | null;
    afterValue: string | null;
    createdAt: Date;
    actor: { id: string; email: string; name: string; role: "ADMIN" | "USER" };
  }>;
} & Parameters<typeof mapTask>[0]): TaskDetailsDto {
  return {
    ...mapTask(task),
    comments: task.comments.map(mapComment),
    activity: task.activities.map(mapActivity),
  };
}
