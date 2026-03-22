import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { RequestUser } from "./request-user";

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user as RequestUser;
});
