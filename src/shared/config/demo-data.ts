import type { ActivityEntry } from "@/entities/activity/model/types";
import type { Project } from "@/entities/project/model/types";
import type { Task } from "@/entities/task/model/types";
import type { User } from "@/entities/user/model/types";
import type { AppSnapshot } from "@/store/types";

const now = new Date().toISOString();

export const demoUsers: User[] = [
  { id: "u_anna", name: "Anna", color: "#2563eb" },
  { id: "u_max", name: "Max", color: "#16a34a" },
  { id: "u_ira", name: "Ira", color: "#f97316" },
];

export const demoProjects: Project[] = [
  {
    id: "p_marketing",
    name: "Marketing Website",
    description: "Launch page and customer onboarding",
    customFieldDefinitions: [
      { id: "cf_effort", name: "Effort", type: "number" },
      { id: "cf_channel", name: "Channel", type: "select", options: ["SEO", "Ads", "Email"] },
    ],
    createdAt: now,
  },
  {
    id: "p_product",
    name: "Product Core",
    description: "Core flows and onboarding",
    customFieldDefinitions: [{ id: "cf_spec", name: "Spec", type: "text" }],
    createdAt: now,
  },
];

export const demoTasks: Task[] = [
  {
    id: "t_1",
    projectId: "p_marketing",
    title: "Hero section redesign",
    description: "Refresh copy and CTA for better conversion",
    status: "todo",
    priority: "high",
    assigneeId: "u_anna",
    customFields: { cf_effort: 8, cf_channel: "SEO" },
    comments: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "t_2",
    projectId: "p_marketing",
    title: "Set up email onboarding",
    description: "Add sequence for new signups",
    status: "in_progress",
    priority: "medium",
    assigneeId: "u_ira",
    customFields: { cf_effort: 5, cf_channel: "Email" },
    comments: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "t_3",
    projectId: "p_product",
    title: "Invite teammates flow",
    description: "Onboarding step for team invites",
    status: "review",
    priority: "urgent",
    assigneeId: "u_max",
    customFields: { cf_spec: "spec-42" },
    comments: [],
    createdAt: now,
    updatedAt: now,
  },
];

export const demoActivityLog: ActivityEntry[] = [];

export const demoSnapshot: AppSnapshot = {
  projects: demoProjects,
  tasks: demoTasks,
  users: demoUsers,
  activityLog: demoActivityLog,
};
