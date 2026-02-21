"use client";

import { useAppStore } from "@/store/use-app-store";

export function BoardFilter(): JSX.Element {
  const users = useAppStore((state) => state.users);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const assigneeFilter = useAppStore((state) => state.assigneeFilter);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const setAssigneeFilter = useAppStore((state) => state.setAssigneeFilter);

  return (
    <div className="flex flex-1 flex-col gap-3 md:flex-row">
      <input
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
        placeholder="Search by task title or description"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />

      <select
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm md:w-56"
        value={assigneeFilter}
        onChange={(event) => setAssigneeFilter(event.target.value)}
      >
        <option value="all">All assignees</option>
        <option value="unassigned">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
