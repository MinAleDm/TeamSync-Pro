import { LocalStorageRepository } from "@/shared/lib/repository/local-storage-repository";
import type { AppStore, AppSnapshot } from "@/store/types";

const repository = new LocalStorageRepository();

interface RollbackState {
  projects: AppStore["projects"];
  tasks: AppStore["tasks"];
  users: AppStore["users"];
  activityLog: AppStore["activityLog"];
  undoStack: AppStore["undoStack"];
}

export function getSnapshotFromState(state: Pick<AppStore, "projects" | "tasks" | "users" | "activityLog">): AppSnapshot {
  return {
    projects: state.projects,
    tasks: state.tasks,
    users: state.users,
    activityLog: state.activityLog,
  };
}

export function getRollbackState(state: AppStore): RollbackState {
  return {
    projects: state.projects,
    tasks: state.tasks,
    users: state.users,
    activityLog: state.activityLog,
    undoStack: state.undoStack,
  };
}

export async function loadSnapshot(): Promise<AppSnapshot | null> {
  return repository.loadSnapshot();
}

export function persistWithRollback(
  set: (
    partial: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>),
  ) => void,
  get: () => AppStore,
  previous: RollbackState,
): void {
  void repository
    .saveSnapshot(getSnapshotFromState(get()))
    .then(() => {
      set({ persistStatus: "idle", persistError: null });
    })
    .catch(() => {
      set({
        ...previous,
        persistStatus: "error",
        persistError: "Не удалось сохранить изменения в localStorage. Выполнен откат.",
      });
    });
}
