import { IsString, MinLength } from "class-validator";

export class RefreshTokenBodyDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
