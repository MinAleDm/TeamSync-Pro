import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateTaskDto, TaskActivityDto, TaskDetailsDto, TaskFiltersDto, TaskListResponseDto, UpdateTaskDto } from "@tracker/types";
import { RedisService } from "../../common/redis/redis.service";
import { RealtimeService } from "../realtime/realtime.service";
import { ActivityRepository } from "./activity.repository";
import { CommentsRepository } from "./comments.repository";
import { mapActivity, mapComment, mapTask, mapTaskDetails } from "./task.mapper";
import { TasksRepository } from "./tasks.repository";

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly redisService: RedisService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async list(userId: string, filters: TaskFiltersDto): Promise<TaskListResponseDto> {
    const cacheKey = `tasks:${filters.projectId}:${JSON.stringify(filters)}`;
    const cached = await this.redisService.get<TaskListResponseDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.tasksRepository.list(userId, filters);
    const payload: TaskListResponseDto = {
      data: result.data.map(mapTask),
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
    };

    await this.redisService.set(cacheKey, payload, 30);
    return payload;
  }

  async create(projectId: string, userId: string, dto: CreateTaskDto) {
    const project = await this.tasksRepository.findProjectWithAccess(projectId, userId);

    if (!project) {
      throw new ForbiddenException("Access denied to project");
    }

    const task = await this.tasksRepository.create(projectId, userId, dto);

    await this.activityRepository.create({
      taskId: task.id,
      actorId: userId,
      action: "task.created",
      afterValue: task.title,
    });

    await this.redisService.deleteByPrefix(`tasks:${projectId}:`);
    this.realtimeService.publishTaskEvent({ projectId, taskId: task.id, action: "created" });

    return mapTask(task);
  }

  async findById(taskId: string, userId: string): Promise<TaskDetailsDto> {
    const task = await this.tasksRepository.findById(taskId, userId);

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    return mapTaskDetails(task);
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto): Promise<TaskDetailsDto> {
    const existing = await this.tasksRepository.findById(taskId, userId);

    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    const updated = await this.tasksRepository.update(taskId, dto);
    const changes = this.collectChanges(existing, dto);

    for (const change of changes) {
      await this.activityRepository.create({
        taskId,
        actorId: userId,
        action: "task.updated",
        field: change.field,
        beforeValue: change.beforeValue,
        afterValue: change.afterValue,
      });
    }

    await this.redisService.deleteByPrefix(`tasks:${existing.projectId}:`);
    this.realtimeService.publishTaskEvent({ projectId: existing.projectId, taskId, action: "updated" });

    return mapTaskDetails(updated);
  }

  async addComment(taskId: string, userId: string, body: string) {
    const existing = await this.tasksRepository.findById(taskId, userId);

    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    const comment = await this.commentsRepository.create(taskId, userId, body);

    await this.activityRepository.create({
      taskId,
      actorId: userId,
      action: "task.commented",
      afterValue: body,
    });

    await this.redisService.deleteByPrefix(`tasks:${existing.projectId}:`);
    this.realtimeService.publishTaskEvent({ projectId: existing.projectId, taskId, action: "commented" });

    return mapComment(comment);
  }

  async listActivity(taskId: string, userId: string): Promise<TaskActivityDto[]> {
    const existing = await this.tasksRepository.findById(taskId, userId);

    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    const activity = await this.activityRepository.list(taskId);
    return activity.map(mapActivity);
  }

  private collectChanges(
    existing: {
      title: string;
      description: string | null;
      status: string;
      priority: string;
      assigneeId: string | null;
    },
    dto: UpdateTaskDto,
  ) {
    const fields: Array<keyof UpdateTaskDto> = ["title", "description", "status", "priority", "assigneeId"];

    return fields
      .filter((field) => dto[field] !== undefined && dto[field] !== existing[field])
      .map((field) => ({
        field,
        beforeValue: existing[field] ? String(existing[field]) : null,
        afterValue: dto[field] ? String(dto[field]) : null,
      }));
  }
}
