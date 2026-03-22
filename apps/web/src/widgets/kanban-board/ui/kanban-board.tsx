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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskDto, TaskStatus } from "@tracker/types";
import { Badge } from "@tracker/ui";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { priorityLabels, priorityTone, statusLabels, statusOrder } from "@/lib/task-meta";
import { useUiStore } from "@/store/use-ui-store";

function TaskCard({
  task,
  onOpen,
}: {
  task: TaskDto;
  onOpen: (taskId: string) => void;
}) {
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
        <Badge tone={priorityTone[task.priority]}>{priorityLabels[task.priority]}</Badge>
      </div>
      <p className="line-clamp-2 text-xs text-muted">{task.description || "No description"}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{task.assignee?.name ?? "Unassigned"}</span>
        <span>{task.commentsCount} comments</span>
      </div>
    </motion.button>
  );
}

function BoardColumn({
  status,
  tasks,
  onOpen,
}: {
  status: TaskStatus;
  tasks: TaskDto[];
  onOpen: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <motion.section
      layout
      ref={setNodeRef}
      className={`rounded-2xl border border-border p-4 ${isOver ? "bg-muted/60" : "bg-card"}`}
    >
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{statusLabels[status]}</h3>
        <span className="rounded-full bg-muted px-2 py-1 text-xs">{tasks.length}</span>
      </header>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onOpen} />
        ))}
      </div>
    </motion.section>
  );
}

export function KanbanBoard({ tasks }: { tasks: TaskDto[] }) {
  const queryClient = useQueryClient();
  const selectedProjectId = useUiStore((state) => state.selectedProjectId);
  const openTask = useUiStore((state) => state.openTask);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const mutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      apiClient.updateTask(taskId, { status }),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", task.projectId] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.task(task.id) });
    },
  });

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    if (!over || !selectedProjectId) {
      return;
    }

    const taskId = String(active.id);
    const nextStatus = String(over.id) as TaskStatus;

    if (!statusOrder.includes(nextStatus)) {
      return;
    }

    mutation.mutate({ taskId, status: nextStatus });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusOrder.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
            onOpen={openTask}
          />
        ))}
      </div>
    </DndContext>
  );
}
