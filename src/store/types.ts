import type { ActivityEntry } from "@/entities/activity/model/types";
import type { Project } from "@/entities/project/model/types";
import type { Task, TaskComment, TaskStatus } from "@/entities/task/model/types";
import type { User } from "@/entities/user/model/types";
import type { UndoCommand } from "@/shared/lib/undo/types";

export interface AppSnapshot {
  projects: Project[];
  tasks: Task[];
  users: User[];
  activityLog: ActivityEntry[];
}

export interface UIState {
  selectedProjectId: string | null;
  searchQuery: string;
  assigneeFilter: string;
  activeTaskId: string | null;
  isTaskModalOpen: boolean;
  isLoading: boolean;
  persistStatus: "idle" | "saving" | "error";
  persistError: string | null;
}

export interface ProjectsSlice {
  projects: Project[];
  createProject: (name: string, description: string) => void;
  addCustomFieldDefinition: (
    projectId: string,
    payload: { name: string; type: "text" | "number" | "select"; options?: string[] },
  ) => void;
}

export interface TasksSlice {
  tasks: Task[];
  createTask: (payload: {
    projectId: string;
    title: string;
    description?: string;
    priority: Task["priority"];
    status: TaskStatus;
    assigneeId: string | null;
    actorId: string;
  }) => void;
  updateTask: (taskId: string, patch: Partial<Omit<Task, "id" | "projectId" | "comments">>, actorId: string) => void;
  moveTask: (taskId: string, nextStatus: TaskStatus, actorId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTaskCustomField: (taskId: string, fieldId: string, value: Task["customFields"][string], actorId: string) => void;
  addComment: (taskId: string, content: string, actorId: string) => void;
}

export interface UsersSlice {
  users: User[];
}

export interface ActivitySlice {
  activityLog: ActivityEntry[];
}

export interface UndoSlice {
  undoStack: UndoCommand[];
  undoLastAction: () => void;
}

export interface UISlice extends UIState {
  initialize: () => Promise<void>;
  setSelectedProject: (projectId: string) => void;
  setSearchQuery: (value: string) => void;
  setAssigneeFilter: (assigneeId: string) => void;
  openTaskModal: (taskId: string) => void;
  closeTaskModal: () => void;
}

export type AppStore =
  & ProjectsSlice
  & TasksSlice
  & UsersSlice
  & ActivitySlice
  & UndoSlice
  & UISlice;

export type PersistedStateKeys = "projects" | "tasks" | "users" | "activityLog";

export interface TaskEditDraft {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Task["priority"];
  assigneeId: string | null;
}

export interface NewCommentDraft {
  content: string;
}

export interface CommentWithAuthor extends TaskComment {
  authorName: string;
}
