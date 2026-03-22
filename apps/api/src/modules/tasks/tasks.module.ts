import { Module } from "@nestjs/common";
import { RealtimeModule } from "../realtime/realtime.module";
import { ActivityRepository } from "./activity.repository";
import { CommentsRepository } from "./comments.repository";
import { TasksController } from "./tasks.controller";
import { TasksRepository } from "./tasks.repository";
import { TasksService } from "./tasks.service";

@Module({
  imports: [RealtimeModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository, CommentsRepository, ActivityRepository],
})
export class TasksModule {}
