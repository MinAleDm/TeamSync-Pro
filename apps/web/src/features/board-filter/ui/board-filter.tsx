"use client";

import type { UserSummaryDto } from "@tracker/types";
import { Input, Select } from "@tracker/ui";
import { useUiStore } from "@/store/use-ui-store";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/shared/config/task-options";

export function BoardFilter({ users }: { users: UserSummaryDto[] }) {
  const search = useUiStore((state) => state.search);
  const status = useUiStore((state) => state.status);
  const priority = useUiStore((state) => state.priority);
  const assigneeId = useUiStore((state) => state.assigneeId);
  const setSearch = useUiStore((state) => state.setSearch);
  const setStatus = useUiStore((state) => state.setStatus);
  const setPriority = useUiStore((state) => state.setPriority);
  const setAssigneeId = useUiStore((state) => state.setAssigneeId);

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Input
        placeholder="Search by title or description"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
        {TASK_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)}>
        {TASK_PRIORITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
        <option value="ALL">All assignees</option>
        <option value="unassigned">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
