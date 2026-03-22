import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: {
    taskId: string;
    actorId: string;
    action: string;
    field?: string | null;
    beforeValue?: string | null;
    afterValue?: string | null;
  }) {
    return this.prisma.taskActivity.create({
      data: {
        taskId: input.taskId,
        actorId: input.actorId,
        action: input.action,
        field: input.field ?? null,
        beforeValue: input.beforeValue ?? null,
        afterValue: input.afterValue ?? null,
      },
      include: {
        actor: true,
      },
    });
  }

  list(taskId: string) {
    return this.prisma.taskActivity.findMany({
      where: { taskId },
      include: {
        actor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
