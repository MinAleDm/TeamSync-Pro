import { buildActivityEntry } from "@/shared/lib/activity-log/service";
import { createId } from "@/shared/lib/utils/id";
import { getRollbackState, persistWithRollback } from "@/store/persistence";
import type { SliceCreator } from "@/store/create-slice";
import type { TasksSlice } from "@/store/types";
import { pushUndoCommand } from "@/shared/lib/undo/types";
import type { ActivityEntry } from "@/entities/activity/model/types";

function resolveUserName(users: Array<{ id: string; name: string }>, userId: string): string {
  return users.find((user) => user.id === userId)?.name ?? "System";
}

function hasTaskPatchChanges(patch: object): boolean {
  return Object.keys(patch).length > 0;
}

export const createTasksSlice: SliceCreator<TasksSlice> = (set, get) => ({
  tasks: [],
  createTask: ({ projectId, title, description = "", priority, status, assigneeId, actorId }) => {
    const previous = getRollbackState(get());
    const now = new Date().toISOString();
    const taskId = createId("task");
    const state = get();
    const actorName = resolveUserName(state.users, actorId);

    const nextTask = {
      id: taskId,
      projectId,
      title,
      description,
      status,
      priority,
      assigneeId,
      customFields: {},
      comments: [],
      createdAt: now,
      updatedAt: now,
    };

    const activityEntry = buildActivityEntry({
      action: "task_created",
      userName: actorName,
      taskId,
      projectId,
      userId: actorId,
      taskTitle: title,
    });

    set((current) => ({
      tasks: [...current.tasks, nextTask],
      activityLog: [...current.activityLog, activityEntry],
      persistStatus: "saving",
      persistError: null,
    }));

    persistWithRollback(set, get, previous);
  },

  updateTask: (taskId, patch, actorId) => {
    const state = get();
    const currentTask = state.tasks.find((task) => task.id === taskId);

    if (!currentTask || !hasTaskPatchChanges(patch)) {
      return;
    }

    const previous = getRollbackState(state);
    const actorName = resolveUserName(state.users, actorId);
    const previousAssigneeName =
      currentTask.assigneeId === null
        ? null
        : state.users.find((user) => user.id === currentTask.assigneeId)?.name ?? "Unknown";

    const nextAssigneeId =
      patch.assigneeId === undefined
        ? currentTask.assigneeId
        : (patch.assigneeId as string | null);

    const nextAssigneeName =
      nextAssigneeId === null
        ? null
        : state.users.find((user) => user.id === nextAssigneeId)?.name ?? "Unknown";

    const statusBefore = currentTask.status;
    const statusAfter = (patch.status as typeof currentTask.status | undefined) ?? currentTask.status;

    const activityEntries: ActivityEntry[] = [];

    if (statusBefore !== statusAfter) {
      activityEntries.push(
        buildActivityEntry({
          action: "status_changed",
          userName: actorName,
          taskId: currentTask.id,
          projectId: currentTask.projectId,
          userId: actorId,
          taskTitle: currentTask.title,
          fromStatus: statusBefore,
          toStatus: statusAfter,
        }),
      );
    }

    if (previousAssigneeName !== nextAssigneeName) {
      activityEntries.push(
        buildActivityEntry({
          action: "assignee_changed",
          userName: actorName,
          taskId: currentTask.id,
          projectId: currentTask.projectId,
          userId: actorId,
          taskTitle: currentTask.title,
          fromAssignee: previousAssigneeName,
          toAssignee: nextAssigneeName,
        }),
      );
    }

    activityEntries.push(
      buildActivityEntry({
        action: "task_edited",
        userName: actorName,
        taskId: currentTask.id,
        projectId: currentTask.projectId,
        userId: actorId,
        taskTitle: currentTask.title,
      }),
    );

    set((current) => ({
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return {
          ...task,
          ...patch,
          updatedAt: new Date().toISOString(),
        };
      }),
      undoStack:
        statusBefore !== statusAfter
          ? pushUndoCommand(current.undoStack, {
              id: createId("undo"),
              createdAt: new Date().toISOString(),
              label: `Undo status change for \"${currentTask.title}\"`,
              type: "change_status",
              taskId: currentTask.id,
              previousStatus: statusBefore,
              nextStatus: statusAfter,
            })
          : current.undoStack,
      activityLog: [...current.activityLog, ...activityEntries],
      persistStatus: "saving",
      persistError: null,
    }));

    persistWithRollback(set, get, previous);
  },

  moveTask: (taskId, nextStatus, actorId) => {
    const state = get();
    const currentTask = state.tasks.find((task) => task.id === taskId);

    if (!currentTask || currentTask.status === nextStatus) {
      return;
    }

    const previous = getRollbackState(state);
    const actorName = resolveUserName(state.users, actorId);

    const activityEntry = buildActivityEntry({
      action: "status_changed",
      userName: actorName,
      taskId,
      projectId: currentTask.projectId,
      userId: actorId,
      taskTitle: currentTask.title,
      fromStatus: currentTask.status,
      toStatus: nextStatus,
    });

    set((current) => ({
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
      undoStack: pushUndoCommand(current.undoStack, {
        id: createId("undo"),
        createdAt: new Date().toISOString(),
        label: `Undo move for \"${currentTask.title}\"`,
        type: "move_task",
        taskId,
        fromStatus: currentTask.status,
        toStatus: nextStatus,
      }),
      activityLog: [...current.activityLog, activityEntry],
      persistStatus: "saving",
      persistError: null,
    }));

    persistWithRollback(set, get, previous);
  },

  deleteTask: (taskId) => {
    const state = get();
    const currentTask = state.tasks.find((task) => task.id === taskId);

    if (!currentTask) {
      return;
    }

    const previous = getRollbackState(state);
    const actorId = state.users[0]?.id ?? "system";
    const actorName = resolveUserName(state.users, actorId);

    const activityEntry = buildActivityEntry({
      action: "task_deleted",
      userName: actorName,
      taskId: currentTask.id,
      projectId: currentTask.projectId,
      userId: actorId,
      taskTitle: currentTask.title,
    });

    set((current) => ({
      tasks: current.tasks.filter((task) => task.id !== taskId),
      undoStack: pushUndoCommand(current.undoStack, {
        id: createId("undo"),
        createdAt: new Date().toISOString(),
        label: `Undo delete for \"${currentTask.title}\"`,
        type: "delete_task",
        task: currentTask,
      }),
      activityLog: [...current.activityLog, activityEntry],
      activeTaskId: current.activeTaskId === taskId ? null : current.activeTaskId,
      isTaskModalOpen: current.activeTaskId === taskId ? false : current.isTaskModalOpen,
      persistStatus: "saving",
      persistError: null,
    }));

    persistWithRollback(set, get, previous);
  },

  updateTaskCustomField: (taskId, fieldId, value, actorId) => {
    const state = get();
    const task = state.tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    const previous = getRollbackState(state);
    const actorName = resolveUserName(state.users, actorId);

    const activityEntry = buildActivityEntry({
      action: "task_edited",
      userName: actorName,
      taskId: task.id,
      projectId: task.projectId,
      userId: actorId,
      taskTitle: task.title,
    });

    set((current) => ({
      tasks: current.tasks.map((item) => {
        if (item.id !== taskId) {
          return item;
        }

        return {
          ...item,
          customFields: {
            ...item.customFields,
            [fieldId]: value,
          },
          updatedAt: new Date().toISOString(),
        };
      }),
      activityLog: [...current.activityLog, activityEntry],
      persistStatus: "saving",
      persistError: null,
    }));

    persistWithRollback(set, get, previous);
  },

  addComment: (taskId, content, actorId) => {
    const state = get();
    const task = state.tasks.find((item) => item.id === taskId);

    if (!task || !content.trim()) {
      return;
    }

    const previous = getRollbackState(state);
    const nextComment = {
      id: createId("comment"),
      authorId: actorId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    set((current) => ({
      tasks: current.tasks.map((item) => {
        if (item.id !== taskId) {
          return item;
        }

        return {
          ...item,
          comments: [...item.comments, nextComment],
          updatedAt: new Date().toISOString(),
        };
      }),
      persistStatus: "saving",
      persistError: null,
    }));

    persistWithRollback(set, get, previous);
  },
});
