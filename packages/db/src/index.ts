import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __trackerPrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__trackerPrisma__ ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__trackerPrisma__ = prisma;
}

export * from "@prisma/client";
