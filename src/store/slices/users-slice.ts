import type { SliceCreator } from "@/store/create-slice";
import type { UsersSlice } from "@/store/types";

export const createUsersSlice: SliceCreator<UsersSlice> = () => ({
  users: [],
});
