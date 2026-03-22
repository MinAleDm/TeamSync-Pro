"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Select } from "@tracker/ui";
import { SignInForm } from "@/features/auth/ui/sign-in-form";
import { BoardFilter } from "@/features/board-filter/ui/board-filter";
import { ProjectCreate } from "@/features/project-create/ui/project-create";
import { ProjectSelector } from "@/features/project-selector/ui/project-selector";
import { TaskCreate } from "@/features/task-create/ui/task-create";
import { TaskModal } from "@/features/task-modal/ui/task-modal";
import { ThemeToggle } from "@/features/theme-toggle/ui/theme-toggle";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useTaskRealtime } from "@/lib/use-task-realtime";
import { SkeletonBoard } from "@/shared/ui/skeleton-board";
import { useUiStore } from "@/store/use-ui-store";
import { KanbanBoard } from "@/widgets/kanban-board/ui/kanban-board";

export function AppShell() {
  const hydrated = useUiStore((state) => state.hydrated);
  const user = useUiStore((state) => state.user);
  const accessToken = useUiStore((state) => state.accessToken);
  const selectedOrganizationId = useUiStore((state) => state.selectedOrganizationId);
  const selectedProjectId = useUiStore((state) => state.selectedProjectId);
  const search = useUiStore((state) => state.search);
  const status = useUiStore((state) => state.status);
  const priority = useUiStore((state) => state.priority);
  const assigneeId = useUiStore((state) => state.assigneeId);
  const clearSession = useUiStore((state) => state.clearSession);
  const setSelectedOrganizationId = useUiStore((state) => state.setSelectedOrganizationId);
  const setSelectedProjectId = useUiStore((state) => state.setSelectedProjectId);

  const organizationsQuery = useQuery({
    queryKey: queryKeys.organizations,
    queryFn: () => apiClient.getOrganizations(),
    enabled: Boolean(accessToken),
  });

  const activeOrganizationId = selectedOrganizationId ?? organizationsQuery.data?.[0]?.id ?? null;

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects(activeOrganizationId ?? undefined),
    queryFn: () => apiClient.getProjects(activeOrganizationId!),
    enabled: Boolean(accessToken && activeOrganizationId),
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.users(activeOrganizationId ?? undefined),
    queryFn: () => apiClient.getUsers(activeOrganizationId!),
    enabled: Boolean(accessToken && activeOrganizationId),
  });

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks(selectedProjectId ?? undefined, {
      search,
      status,
      priority,
      assigneeId,
    }),
    queryFn: () => {
      const params = new URLSearchParams();

      if (search) {
        params.set("search", search);
      }

      if (status !== "ALL") {
        params.set("status", status);
      }

      if (priority !== "ALL") {
        params.set("priority", priority);
      }

      if (assigneeId === "unassigned") {
        params.set("assigneeId", "unassigned");
      } else if (assigneeId !== "ALL") {
        params.set("assigneeId", assigneeId);
      }

      return apiClient.getTasks(selectedProjectId!, params);
    },
    enabled: Boolean(accessToken && selectedProjectId),
  });

  useTaskRealtime(selectedProjectId);

  useEffect(() => {
    if (!selectedOrganizationId && organizationsQuery.data?.[0]) {
      setSelectedOrganizationId(organizationsQuery.data[0].id);
    }
  }, [organizationsQuery.data, selectedOrganizationId, setSelectedOrganizationId]);

  useEffect(() => {
    if (!selectedProjectId && projectsQuery.data?.[0]) {
      setSelectedProjectId(projectsQuery.data[0].id);
    }
  }, [projectsQuery.data, selectedProjectId, setSelectedProjectId]);

  if (!hydrated) {
    return <SkeletonBoard />;
  }

  if (!accessToken || !user) {
    return <SignInForm />;
  }

  const projects = projectsQuery.data ?? [];
  const members = usersQuery.data ?? [];
  const tasks = tasksQuery.data?.data ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-[1600px] px-4 py-6 md:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Workspace</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">Tracker Platform</h1>
              <p className="mt-2 text-sm text-muted">{user.name}</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">Organization</p>
            <Select
              value={activeOrganizationId ?? ""}
              onChange={(event) => setSelectedOrganizationId(event.target.value)}
            >
              {(organizationsQuery.data ?? []).map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Projects</p>
              <span className="text-xs text-muted">{projects.length}</span>
            </div>
            <ProjectSelector projects={projects} />
          </div>

          {activeOrganizationId && user.role === "ADMIN" ? (
            <div className="mt-6">
              <ProjectCreate organizationId={activeOrganizationId} />
            </div>
          ) : null}

          <Button className="mt-6 w-full" variant="ghost" onClick={clearSession}>
            Sign out
          </Button>
        </Card>

        <section className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Overview</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {projects.find((project) => project.id === selectedProjectId)?.name ?? "Select a project"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Kanban board with API-backed tasks, comments, activity, and realtime updates.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/60 px-4 py-3 text-sm">
                <span className="block text-xs uppercase tracking-wide text-muted">Open tasks</span>
                <span className="text-lg font-semibold">{tasks.length}</span>
              </div>
            </div>

            <div className="mt-5">
              <BoardFilter users={members} />
            </div>

            {selectedProjectId ? (
              <div className="mt-5">
                <TaskCreate projectId={selectedProjectId} users={members} />
              </div>
            ) : null}
          </Card>

          {tasksQuery.isLoading ? <SkeletonBoard /> : <KanbanBoard tasks={tasks} />}
        </section>
      </div>

      <TaskModal users={members} />
    </main>
  );
}
