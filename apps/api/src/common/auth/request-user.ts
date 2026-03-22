import type { UserRole } from "@tracker/types";

export interface RequestUser {
  userId: string;
  email: string;
  role: UserRole;
}
