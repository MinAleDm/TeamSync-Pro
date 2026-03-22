import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateProjectBodyDto {
  @IsString()
  organizationId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(8)
  @Matches(/^[A-Z0-9_-]+$/)
  key!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
