import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import type { RequestUser } from "../../common/auth/request-user";
import { OrganizationsService } from "./organizations.service";

@UseGuards(JwtAuthGuard)
@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.organizationsService.listForUser(user.userId);
  }
}
