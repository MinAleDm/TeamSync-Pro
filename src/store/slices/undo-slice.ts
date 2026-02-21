import { getRollbackState, persistWithRollback } from "@/store/persistence";
import type { SliceCreator } from "@/store/create-slice";
import type { UndoSlice } from "@/store/types";

export const createUndoSlice: SliceCreator<UndoSlice> = (set, get) => ({
  undoStack: [],
  undoLastAction: () => {
    const state = get();
    const lastCommand = state.undoStack.at(-1);

    if (!lastCommand) {
      return;
    }

    const previous = getRollbackState(state);

    set((current) => {
      if (lastCommand.type === "move_task") {
        return {
          tasks: current.tasks.map((task) =>
            task.id === lastCommand.taskId
              ? {
                  ...task,
                  status: lastCommand.fromStatus,
                  updatedAt: new Date().toISOString(),
                }
              : task,
          ),
          undoStack: current.undoStack.slice(0, -1),
          persistStatus: "saving",
          persistError: null,
        };
      }

      if (lastCommand.type === "change_status") {
        return {
          tasks: current.tasks.map((task) =>
            task.id === lastCommand.taskId
              ? {
                  ...task,
                  status: lastCommand.previousStatus,
                  updatedAt: new Date().toISOString(),
                }
              : task,
          ),
          undoStack: current.undoStack.slice(0, -1),
          persistStatus: "saving",
          persistError: null,
        };
      }

      const exists = current.tasks.some((task) => task.id === lastCommand.task.id);

      return {
        tasks: exists ? current.tasks : [...current.tasks, lastCommand.task],
        undoStack: current.undoStack.slice(0, -1),
        persistStatus: "saving",
        persistError: null,
      };
    });

    persistWithRollback(set, get, previous);
  },
});
