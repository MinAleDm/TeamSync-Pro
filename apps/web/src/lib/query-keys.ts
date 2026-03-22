export const queryKeys = {
  me: ["auth", "me"] as const,
  organizations: ["organizations"] as const,
  projects: (organizationId?: string) => ["projects", organizationId] as const,
  users: (organizationId?: string) => ["users", organizationId] as const,
  tasks: (projectId?: string, filters?: Record<string, string | number | undefined>) =>
    ["tasks", projectId, filters] as const,
  task: (taskId?: string) => ["task", taskId] as const,
};
