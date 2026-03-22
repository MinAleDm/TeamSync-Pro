"use client";

import type { ProjectDto } from "@tracker/types";
import clsx from "clsx";
import { useUiStore } from "@/store/use-ui-store";

export function ProjectSelector({ projects }: { projects: ProjectDto[] }) {
  const selectedProjectId = useUiStore((state) => state.selectedProjectId);
  const setSelectedProjectId = useUiStore((state) => state.setSelectedProjectId);

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <button
          key={project.id}
          type="button"
          className={clsx(
            "w-full rounded-2xl border px-4 py-3 text-left transition",
            selectedProjectId === project.id
              ? "border-accent bg-accent/10"
              : "border-border bg-card hover:bg-muted/70",
          )}
          onClick={() => setSelectedProjectId(project.id)}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{project.name}</p>
              <p className="text-xs text-muted">{project.key}</p>
            </div>
            <span className="rounded-full bg-muted px-2 py-1 text-xs">{project.taskCount ?? 0}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
