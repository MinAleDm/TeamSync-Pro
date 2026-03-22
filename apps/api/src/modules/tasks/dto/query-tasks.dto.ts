import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES } from "./task.constants";

export class QueryTasksDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  status?: (typeof TASK_STATUS_VALUES)[number];

  @IsOptional()
  @IsIn(TASK_PRIORITY_VALUES)
  priority?: (typeof TASK_PRIORITY_VALUES)[number];

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
