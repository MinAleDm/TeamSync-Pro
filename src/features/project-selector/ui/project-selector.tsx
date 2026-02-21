"use client";

import { useAppStore } from "@/store/use-app-store";

export function ProjectSelector(): JSX.Element {
  const projects = useAppStore((state) => state.projects);
  const selectedProjectId = useAppStore((state) => state.selectedProjectId);
  const setSelectedProject = useAppStore((state) => state.setSelectedProject);

  return (
    <label className="flex min-w-56 flex-col gap-1 text-sm">
      <span className="text-xs uppercase tracking-wide text-muted">Project</span>
      <select
        className="rounded-lg border border-border bg-card px-3 py-2"
        value={selectedProjectId ?? ""}
        onChange={(event) => setSelectedProject(event.target.value)}
      >
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </label>
  );
}
