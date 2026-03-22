"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TaskPriority, TaskStatus, UserSummaryDto } from "@tracker/types";
import { Badge, Button, Input, Modal, Select, Textarea } from "@tracker/ui";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { priorityLabels, priorityTone, statusLabels } from "@/lib/task-meta";
import { useUiStore } from "@/store/use-ui-store";

export function TaskModal({ users }: { users: UserSummaryDto[] }) {
  const queryClient = useQueryClient();
  const activeTaskId = useUiStore((state) => state.activeTaskId);
  const closeTask = useUiStore((state) => state.closeTask);
  const selectedProjectId = useUiStore((state) => state.selectedProjectId);

  const taskQuery = useQuery({
    queryKey: queryKeys.task(activeTaskId ?? undefined),
    queryFn: () => apiClient.getTask(activeTaskId!),
    enabled: Boolean(activeTaskId),
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!taskQuery.data) {
      return;
    }

    setTitle(taskQuery.data.title);
    setDescription(taskQuery.data.description ?? "");
    setStatus(taskQuery.data.status);
    setPriority(taskQuery.data.priority);
    setAssigneeId(taskQuery.data.assignee?.id ?? "");
  }, [taskQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      apiClient.updateTask(activeTaskId!, {
        title,
        description,
        status,
        priority,
        assigneeId: assigneeId || null,
      }),
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", task.projectId] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.task(task.id) });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => apiClient.createComment(activeTaskId!, comment),
    onSuccess: async () => {
      setComment("");
      if (activeTaskId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.task(activeTaskId) });
      }
      if (selectedProjectId) {
        await queryClient.invalidateQueries({ queryKey: ["tasks", selectedProjectId] });
      }
    },
  });

  if (!activeTaskId || !taskQuery.data) {
    return null;
  }

  const task = taskQuery.data;

  return (
    <Modal title={task.title} subtitle={`Task ${task.id}`} onClose={closeTask}>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block">Title</span>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>

            <label className="text-sm">
              <span className="mb-1 block">Assignee</span>
              <Select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block">Status</span>
              <Select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block">Priority</span>
              <Select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block">Description</span>
            <Textarea rows={6} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={priorityTone[task.priority]}>{priorityLabels[task.priority]}</Badge>
            <span className="text-sm text-muted">{task.commentsCount} comments</span>
            <Button variant="primary" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">Comments</p>
            <div className="mt-4 space-y-3">
              {task.comments.map((item) => (
                <div key={item.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted">
                    <span>{item.author.name}</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <Textarea
                rows={2}
                placeholder="Add a comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              <Button
                variant="secondary"
                disabled={commentMutation.isPending || comment.trim().length === 0}
                onClick={() => commentMutation.mutate()}
              >
                Send
              </Button>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Activity</p>
          <div className="mt-4 space-y-3">
            {task.activity.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-3 text-sm">
                <p className="font-medium">{item.actor.name}</p>
                <p className="mt-1 text-muted">
                  {item.action}
                  {item.field ? ` • ${item.field}` : ""}
                </p>
                {item.afterValue ? <p className="mt-2">{item.afterValue}</p> : null}
                <p className="mt-2 text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Modal>
  );
}
