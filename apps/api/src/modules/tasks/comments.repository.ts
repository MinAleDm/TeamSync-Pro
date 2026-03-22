import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(taskId: string, authorId: string, body: string) {
    return this.prisma.taskComment.create({
      data: {
        taskId,
        authorId,
        body,
      },
      include: {
        author: true,
      },
    });
  }
}
