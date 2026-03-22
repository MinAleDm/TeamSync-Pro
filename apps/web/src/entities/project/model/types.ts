import type { CustomFieldDefinition } from "@/entities/task/model/types";

export interface Project {
  id: string;
  name: string;
  description: string;
  customFieldDefinitions: CustomFieldDefinition[];
  createdAt: string;
}
