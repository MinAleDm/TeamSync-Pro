import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES } from "./task.constants";

export class CreateTaskBodyDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsIn(TASK_STATUS_VALUES)
  status?: (typeof TASK_STATUS_VALUES)[number];

  @IsOptional()
  @IsIn(TASK_PRIORITY_VALUES)
  priority?: (typeof TASK_PRIORITY_VALUES)[number];

  @IsOptional()
  @IsString()
  assigneeId?: string | null;
}
