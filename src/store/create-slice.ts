import type { StateCreator } from "zustand";
import type { AppStore } from "@/store/types";

export type SliceCreator<TSlice> = StateCreator<AppStore, [], [], TSlice>;
