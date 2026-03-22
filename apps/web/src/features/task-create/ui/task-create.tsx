"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserSummaryDto } from "@tracker/types";
import { Button, Input, Select, Textarea } from "@tracker/ui";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export function TaskCreate({ projectId, users }: { projectId: string; users: UserSummaryDto[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.createTask(projectId, {
        title,
        description,
        priority,
        assigneeId: assigneeId || undefined,
      }),
    onSuccess: async () => {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setAssigneeId("");
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  return (
    <div className="rounded-2xl border border-border bg-muted/60 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Create task</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-[2fr_1.2fr_1fr_auto]">
        <Input placeholder="Task title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Textarea
          rows={1}
          placeholder="Short description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>

          <Select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="primary"
          disabled={mutation.isPending || title.trim().length < 3}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Adding..." : "Add"}
        </Button>
      </div>
    </div>
  );
}
