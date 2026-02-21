import type { SliceCreator } from "@/store/create-slice";
import type { ActivitySlice } from "@/store/types";

export const createActivitySlice: SliceCreator<ActivitySlice> = () => ({
  activityLog: [],
});
