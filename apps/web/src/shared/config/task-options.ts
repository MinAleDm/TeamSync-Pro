export const TASK_STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
] as const;

export const TASK_PRIORITY_OPTIONS = [
  { value: "ALL", label: "All priorities" },
  { value: "LOW", label: "Low priority" },
  { value: "MEDIUM", label: "Medium priority" },
  { value: "HIGH", label: "High priority" },
  { value: "URGENT", label: "Urgent priority" },
] as const;
