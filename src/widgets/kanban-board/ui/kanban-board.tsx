"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import type { Task, TaskStatus } from "@/entities/task/model/types";
import { STATUS_LABELS, STATUS_ORDER } from "@/shared/lib/utils/status";
import { PriorityBadge } from "@/shared/ui/priority-badge";
import { useAppStore } from "@/store/use-app-store";

function TaskCard({
  task,
  assignee,
  onOpen,
}: {
  task: Task;
  assignee: string;
  onOpen: (taskId: string) => void;
}): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <motion.button
      layout
      ref={setNodeRef}
      type="button"
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(task.id)}
      className="w-full rounded-xl border border-border bg-card p-3 text-left shadow-sm transition hover:shadow-soft"
      animate={{ opacity: isDragging ? 0.7 : 1 }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold">{task.title}</p>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="line-clamp-2 text-xs text-muted">{task.description || "No description"}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{assignee}</span>
        <span>{task.comments.length} comments</span>
      </div>
    </motion.button>
  );
}

function BoardColumn({
  status,
  tasks,
  assigneeByTask,
  onOpen,
}: {
  status: TaskStatus;
  tasks: Task[];
  assigneeByTask: Map<string, string>;
  onOpen: (taskId: string) => void;
}): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <motion.section
      layout
      ref={setNodeRef}
      className={`rounded-2xl border border-border p-4 ${isOver ? "bg-muted/60" : "bg-card"}`}
    >
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{STATUS_LABELS[status]}</h3>
        <span className="rounded-full bg-muted px-2 py-1 text-xs">{tasks.length}</span>
      </header>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            assignee={assigneeByTask.get(task.id) ?? "Unassigned"}
            onOpen={onOpen}
          />
        ))}
      </div>
    </motion.section>
  );
}

export function KanbanBoard(): JSX.Element {
  const tasks = useAppStore((state) => state.tasks);
  const users = useAppStore((state) => state.users);
  const selectedProjectId = useAppStore((state) => state.selectedProjectId);
  const searchQuery = useAppStore((state) => state.searchQuery.toLowerCase());
  const assigneeFilter = useAppStore((state) => state.assigneeFilter);
  const openTaskModal = useAppStore((state) => state.openTaskModal);
  const moveTask = useAppStore((state) => state.moveTask);

  const actorId = users[0]?.id;

  const assigneeByTask = new Map(
    tasks.map((task) => [
      task.id,
      task.assigneeId ? users.find((user) => user.id === task.assigneeId)?.name ?? "Unknown" : "Unassigned",
    ]),
  );

  const visibleTasks = tasks.filter((task) => {
    if (!selectedProjectId || task.projectId !== selectedProjectId) {
      return false;
    }

    if (assigneeFilter === "unassigned" && task.assigneeId !== null) {
      return false;
    }

    if (assigneeFilter !== "all" && assigneeFilter !== "unassigned" && task.assigneeId !== assigneeFilter) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    return `${task.title} ${task.description}`.toLowerCase().includes(searchQuery);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    if (!over || !actorId) {
      return;
    }

    const taskId = String(active.id);
    const nextStatus = String(over.id) as TaskStatus;

    if (!STATUS_ORDER.includes(nextStatus)) {
      return;
    }

    moveTask(taskId, nextStatus, actorId);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUS_ORDER.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={visibleTasks.filter((task) => task.status === status)}
            assigneeByTask={assigneeByTask}
            onOpen={openTaskModal}
          />
        ))}
      </div>
    </DndContext>
  );
}
