import { createId } from "@/shared/lib/utils/id";
import { getRollbackState, persistWithRollback } from "@/store/persistence";
import type { SliceCreator } from "@/store/create-slice";
import type { ProjectsSlice } from "@/store/types";

export const createProjectsSlice: SliceCreator<ProjectsSlice> = (set, get) => ({
  projects: [],
  createProject: (name, description) => {
    const previous = getRollbackState(get());
    const projectId = createId("project");

    set((state) => ({
      projects: [
        ...state.projects,
        {
          id: projectId,
          name,
          description,
          customFieldDefinitions: [],
          createdAt: new Date().toISOString(),
        },
      ],
      selectedProjectId: projectId,
      persistStatus: "saving",
      persistError: null,
    }));

    persistWithRollback(set, get, previous);
  },
  addCustomFieldDefinition: (projectId, payload) => {
    const previous = getRollbackState(get());

    set((state) => ({
      projects: state.projects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        return {
          ...project,
          customFieldDefinitions: [
            ...project.customFieldDefinitions,
            {
              id: createId("cf"),
              name: payload.name,
              type: payload.type,
              options: payload.type === "select" ? (payload.options ?? []) : undefined,
            },
          ],
        };
      }),
      persistStatus: "saving",
      persistError: null,
    }));

    persistWithRollback(set, get, previous);
  },
});
