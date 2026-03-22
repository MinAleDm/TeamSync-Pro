import { create } from "zustand";
import { createActivitySlice } from "@/store/slices/activity-slice";
import { createProjectsSlice } from "@/store/slices/projects-slice";
import { createTasksSlice } from "@/store/slices/tasks-slice";
import { createUISlice } from "@/store/slices/ui-slice";
import { createUndoSlice } from "@/store/slices/undo-slice";
import { createUsersSlice } from "@/store/slices/users-slice";
import type { AppStore } from "@/store/types";

export const useAppStore = create<AppStore>()((...args) => ({
  ...createProjectsSlice(...args),
  ...createTasksSlice(...args),
  ...createUsersSlice(...args),
  ...createActivitySlice(...args),
  ...createUndoSlice(...args),
  ...createUISlice(...args),
}));
