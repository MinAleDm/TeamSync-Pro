"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/shared/ui/button";
import { useAppStore } from "@/store/use-app-store";

export function TaskCreate(): JSX.Element {
  const selectedProjectId = useAppStore((state) => state.selectedProjectId);
  const users = useAppStore((state) => state.users);
  const createTask = useAppStore((state) => state.createTask);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [status, setStatus] = useState<"todo" | "in_progress" | "review" | "done">("todo");
  const [assigneeId, setAssigneeId] = useState<string>("unassigned");

  const actorId = users[0]?.id;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!selectedProjectId || !title.trim() || !actorId) {
      return;
    }

    createTask({
      projectId: selectedProjectId,
      title: title.trim(),
      priority,
      status,
      assigneeId: assigneeId === "unassigned" ? null : assigneeId,
      actorId,
    });

    setTitle("");
  };

  return (
    <form className="grid gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-5" onSubmit={handleSubmit}>
      <input
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm md:col-span-2"
        placeholder="Quick task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <select
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        value={priority}
        onChange={(event) => setPriority(event.target.value as typeof priority)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <select
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        value={status}
        onChange={(event) => setStatus(event.target.value as typeof status)}
      >
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="review">Review</option>
        <option value="done">Done</option>
      </select>

      <div className="flex gap-2">
        <select
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
        >
          <option value="unassigned">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <Button variant="primary" type="submit">
          Add
        </Button>
      </div>
    </form>
  );
}
