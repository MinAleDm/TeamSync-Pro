"use client";

import { useEffect } from "react";
import { BoardFilter } from "@/features/board-filter/ui/board-filter";
import { ProjectCreate } from "@/features/project-create/ui/project-create";
import { ProjectSelector } from "@/features/project-selector/ui/project-selector";
import { TaskCreate } from "@/features/task-create/ui/task-create";
import { TaskModal } from "@/features/task-modal/ui/task-modal";
import { ThemeToggle } from "@/features/theme-toggle/ui/theme-toggle";
import { UndoToast } from "@/features/undo-toast/ui/undo-toast";
import { SkeletonBoard } from "@/shared/ui/skeleton-board";
import { useAppStore } from "@/store/use-app-store";
import { KanbanBoard } from "@/widgets/kanban-board/ui/kanban-board";

export function AppShell(): JSX.Element {
  const initialize = useAppStore((state) => state.initialize);
  const isLoading = useAppStore((state) => state.isLoading);
  const persistStatus = useAppStore((state) => state.persistStatus);
  const persistError = useAppStore((state) => state.persistError);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">
      <section className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TeamSync Pro</h1>
            <p className="text-sm text-muted">SaaS-style Kanban board on localStorage</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="mb-3 flex flex-wrap items-end gap-3">
          <ProjectSelector />
          <BoardFilter />
        </div>

        <div className="mb-3">
          <ProjectCreate />
        </div>

        <TaskCreate />

        <div className="mt-3 text-xs">
          {persistStatus === "saving" ? <span className="text-muted">Saving...</span> : null}
          {persistError ? <span className="text-rose-500">{persistError}</span> : null}
        </div>
      </section>

      {isLoading ? <SkeletonBoard /> : <KanbanBoard />}

      <TaskModal />
      <UndoToast />
    </main>
  );
}
