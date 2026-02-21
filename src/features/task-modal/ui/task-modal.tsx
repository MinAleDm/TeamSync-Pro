"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CustomFieldType, TaskPriority, TaskStatus } from "@/entities/task/model/types";
import { formatDateTime } from "@/shared/lib/utils/date";
import { STATUS_LABELS } from "@/shared/lib/utils/status";
import { Button } from "@/shared/ui/button";
import { ModalPortal } from "@/shared/ui/modal-portal";
import { PriorityBadge } from "@/shared/ui/priority-badge";
import { useAppStore } from "@/store/use-app-store";

interface TaskDraft {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
}

const emptyDraft: TaskDraft = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assigneeId: null,
};

export function TaskModal() {
  const tasks = useAppStore((state) => state.tasks);
  const users = useAppStore((state) => state.users);
  const projects = useAppStore((state) => state.projects);
  const activityLog = useAppStore((state) => state.activityLog);
  const activeTaskId = useAppStore((state) => state.activeTaskId);
  const isTaskModalOpen = useAppStore((state) => state.isTaskModalOpen);
  const closeTaskModal = useAppStore((state) => state.closeTaskModal);
  const updateTask = useAppStore((state) => state.updateTask);
  const addComment = useAppStore((state) => state.addComment);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const addCustomFieldDefinition = useAppStore((state) => state.addCustomFieldDefinition);
  const updateTaskCustomField = useAppStore((state) => state.updateTaskCustomField);

  const actorId = users[0]?.id;

  const task = tasks.find((item) => item.id === activeTaskId) ?? null;
  const project = projects.find((item) => item.id === task?.projectId) ?? null;

  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [commentText, setCommentText] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");

  useEffect(() => {
    if (!task) {
      return;
    }

    setDraft({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
    });
  }, [task]);

  const taskActivities = useMemo(
    () => activityLog.filter((entry) => entry.taskId === task?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [activityLog, task?.id],
  );

  if (!task || !project) {
    return null;
  }

  const handleSave = (): void => {
    if (!actorId || !draft.title.trim()) {
      return;
    }

    updateTask(
      task.id,
      {
        title: draft.title.trim(),
        description: draft.description.trim(),
        status: draft.status,
        priority: draft.priority,
        assigneeId: draft.assigneeId,
      },
      actorId,
    );
  };

  const handleAddComment = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!actorId || !commentText.trim()) {
      return;
    }

    addComment(task.id, commentText, actorId);
    setCommentText("");
  };

  const handleAddCustomField = (): void => {
    if (!newFieldName.trim()) {
      return;
    }

    addCustomFieldDefinition(project.id, {
      name: newFieldName.trim(),
      type: newFieldType,
      options:
        newFieldType === "select"
          ? newFieldOptions
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
    });

    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldOptions("");
  };

  const handleCustomFieldChange = (
    fieldId: string,
    fieldType: CustomFieldType,
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    if (!actorId) {
      return;
    }

    const rawValue = event.target.value;

    if (fieldType === "number") {
      const numeric = Number(rawValue);
      updateTaskCustomField(task.id, fieldId, Number.isNaN(numeric) ? null : numeric, actorId);
      return;
    }

    updateTaskCustomField(task.id, fieldId, rawValue, actorId);
  };

  const comments = task.comments.map((comment) => ({
    ...comment,
    authorName: users.find((user) => user.id === comment.authorId)?.name ?? "Unknown",
  }));

  return (
    <ModalPortal>
      <AnimatePresence>
        {isTaskModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/45 p-4"
            onClick={closeTaskModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              className="mx-auto mt-4 max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl border border-border bg-surface p-6 shadow-soft"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Task Editor</p>
                  <h2 className="text-xl font-semibold">{task.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <Button onClick={closeTaskModal}>Close</Button>
                </div>
              </header>

              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <section className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm">
                      <span>Title</span>
                      <input
                        className="rounded-lg border border-border bg-card px-3 py-2"
                        value={draft.title}
                        onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                      <span>Assignee</span>
                      <select
                        className="rounded-lg border border-border bg-card px-3 py-2"
                        value={draft.assigneeId ?? "unassigned"}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            assigneeId: event.target.value === "unassigned" ? null : event.target.value,
                          }))
                        }
                      >
                        <option value="unassigned">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                      <span>Status</span>
                      <select
                        className="rounded-lg border border-border bg-card px-3 py-2"
                        value={draft.status}
                        onChange={(event) =>
                          setDraft((prev) => ({ ...prev, status: event.target.value as TaskStatus }))
                        }
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                      <span>Priority</span>
                      <select
                        className="rounded-lg border border-border bg-card px-3 py-2"
                        value={draft.priority}
                        onChange={(event) =>
                          setDraft((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </label>
                  </div>

                  <label className="flex flex-col gap-1 text-sm">
                    <span>Description</span>
                    <textarea
                      className="min-h-24 rounded-lg border border-border bg-card px-3 py-2"
                      value={draft.description}
                      onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                    />
                  </label>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold">Custom Fields</h3>

                    <div className="space-y-3">
                      {project.customFieldDefinitions.map((field) => (
                        <label key={field.id} className="flex flex-col gap-1 text-sm">
                          <span>{field.name}</span>

                          {field.type === "text" ? (
                            <input
                              className="rounded-lg border border-border bg-surface px-3 py-2"
                              value={String(task.customFields[field.id] ?? "")}
                              onChange={(event) => handleCustomFieldChange(field.id, field.type, event)}
                            />
                          ) : null}

                          {field.type === "number" ? (
                            <input
                              className="rounded-lg border border-border bg-surface px-3 py-2"
                              type="number"
                              value={String(task.customFields[field.id] ?? "")}
                              onChange={(event) => handleCustomFieldChange(field.id, field.type, event)}
                            />
                          ) : null}

                          {field.type === "select" ? (
                            <select
                              className="rounded-lg border border-border bg-surface px-3 py-2"
                              value={String(task.customFields[field.id] ?? "")}
                              onChange={(event) => handleCustomFieldChange(field.id, field.type, event)}
                            >
                              <option value="">Select option</option>
                              {(field.options ?? []).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : null}
                        </label>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-2 rounded-lg border border-dashed border-border p-3 md:grid-cols-4">
                      <input
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm md:col-span-2"
                        placeholder="Field name"
                        value={newFieldName}
                        onChange={(event) => setNewFieldName(event.target.value)}
                      />

                      <select
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                        value={newFieldType}
                        onChange={(event) => setNewFieldType(event.target.value as CustomFieldType)}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="select">Select</option>
                      </select>

                      <Button onClick={handleAddCustomField}>Add field</Button>

                      {newFieldType === "select" ? (
                        <input
                          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm md:col-span-4"
                          placeholder="Options separated by comma"
                          value={newFieldOptions}
                          onChange={(event) => setNewFieldOptions(event.target.value)}
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" onClick={handleSave}>
                      Save changes
                    </Button>
                    <Button variant="danger" onClick={() => deleteTask(task.id)}>
                      Delete task
                    </Button>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold">Comments</h3>
                    <div className="max-h-44 space-y-2 overflow-auto pr-1">
                      {comments.length === 0 ? (
                        <p className="text-sm text-muted">No comments yet.</p>
                      ) : (
                        comments.map((comment) => (
                          <article key={comment.id} className="rounded-lg border border-border bg-surface p-2 text-sm">
                            <p className="font-medium">{comment.authorName}</p>
                            <p>{comment.content}</p>
                            <p className="mt-1 text-xs text-muted">{formatDateTime(comment.createdAt)}</p>
                          </article>
                        ))
                      )}
                    </div>

                    <form className="mt-3 flex gap-2" onSubmit={handleAddComment}>
                      <input
                        className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                        placeholder="Write comment"
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                      />
                      <Button type="submit">Send</Button>
                    </form>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold">Activity Log</h3>
                    <div className="max-h-64 space-y-2 overflow-auto pr-1">
                      {taskActivities.length === 0 ? (
                        <p className="text-sm text-muted">No history yet.</p>
                      ) : (
                        taskActivities.map((entry) => (
                          <article key={entry.id} className="rounded-lg border border-border bg-surface p-2 text-sm">
                            <p>{entry.message}</p>
                            <p className="mt-1 text-xs text-muted">{formatDateTime(entry.createdAt)}</p>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ModalPortal>
  );
}
