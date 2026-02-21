import type { AppRepository } from "@/shared/lib/repository/app-repository";
import type { AppSnapshot } from "@/store/types";

const STORAGE_KEY = "team-sync-pro:snapshot:v1";
const SAVE_DELAY_MS = 120;

export class LocalStorageRepository implements AppRepository {
  async loadSnapshot(): Promise<AppSnapshot | null> {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AppSnapshot;
  }

  async saveSnapshot(snapshot: AppSnapshot): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), SAVE_DELAY_MS);
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }
}
