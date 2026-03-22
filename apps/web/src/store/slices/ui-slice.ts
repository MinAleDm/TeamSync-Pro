import { demoSnapshot } from "@/shared/config/demo-data";
import { loadSnapshot, persistWithRollback } from "@/store/persistence";
import type { SliceCreator } from "@/store/create-slice";
import type { UISlice } from "@/store/types";

export const createUISlice: SliceCreator<UISlice> = (set, get) => ({
  selectedProjectId: null,
  searchQuery: "",
  assigneeFilter: "all",
  activeTaskId: null,
  isTaskModalOpen: false,
  isLoading: true,
  persistStatus: "idle",
  persistError: null,

  initialize: async () => {
    const state = get();
    if (!state.isLoading) {
      return;
    }

    try {
      const snapshot = await loadSnapshot();
      const source = snapshot ?? demoSnapshot;

      set({
        projects: source.projects,
        tasks: source.tasks,
        users: source.users,
        activityLog: source.activityLog,
        selectedProjectId: source.projects[0]?.id ?? null,
        isLoading: false,
        persistStatus: "idle",
        persistError: null,
      });

      if (!snapshot) {
        const previous = {
          projects: [],
          tasks: [],
          users: [],
          activityLog: [],
          undoStack: [],
        };

        persistWithRollback(set, get, previous);
      }
    } catch {
      set({
        projects: demoSnapshot.projects,
        tasks: demoSnapshot.tasks,
        users: demoSnapshot.users,
        activityLog: demoSnapshot.activityLog,
        selectedProjectId: demoSnapshot.projects[0]?.id ?? null,
        isLoading: false,
        persistStatus: "error",
        persistError: "Не удалось загрузить localStorage. Загружены demo-данные.",
      });
    }
  },

  setSelectedProject: (projectId) => {
    set({
      selectedProjectId: projectId,
      activeTaskId: null,
      isTaskModalOpen: false,
    });
  },

  setSearchQuery: (value) => {
    set({ searchQuery: value });
  },

  setAssigneeFilter: (assigneeId) => {
    set({ assigneeFilter: assigneeId });
  },

  openTaskModal: (taskId) => {
    set({ activeTaskId: taskId, isTaskModalOpen: true });
  },

  closeTaskModal: () => {
    set({ activeTaskId: null, isTaskModalOpen: false });
  },
});
