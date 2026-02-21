import type { Task, TaskStatus } from "@/entities/task/model/types";

interface BaseUndoCommand {
  id: string;
  createdAt: string;
  label: string;
}

export interface MoveTaskUndoCommand extends BaseUndoCommand {
  type: "move_task";
  taskId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
}

export interface DeleteTaskUndoCommand extends BaseUndoCommand {
  type: "delete_task";
  task: Task;
}

export interface ChangeStatusUndoCommand extends BaseUndoCommand {
  type: "change_status";
  taskId: string;
  previousStatus: TaskStatus;
  nextStatus: TaskStatus;
}

export type UndoCommand =
  | MoveTaskUndoCommand
  | DeleteTaskUndoCommand
  | ChangeStatusUndoCommand;

const MAX_STACK_SIZE = 30;

export function pushUndoCommand(stack: UndoCommand[], command: UndoCommand): UndoCommand[] {
  const next = [...stack, command];
  return next.slice(Math.max(0, next.length - MAX_STACK_SIZE));
}
