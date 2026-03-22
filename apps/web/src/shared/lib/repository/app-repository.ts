import type { AppSnapshot } from "@/store/types";

export interface AppRepository {
  loadSnapshot: () => Promise<AppSnapshot | null>;
  saveSnapshot: (snapshot: AppSnapshot) => Promise<void>;
}
