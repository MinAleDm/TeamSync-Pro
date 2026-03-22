import { ForbiddenException, Injectable } from "@nestjs/common";
import type { OrganizationDto, UserSummaryDto } from "@tracker/types";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  async listOrganizations(userId: string): Promise<OrganizationDto[]> {
    const memberships = await this.usersRepository.listOrganizations(userId);

    return memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
    }));
  }

  async listUsers(currentUserId: string, organizationId?: string): Promise<UserSummaryDto[]> {
    if (organizationId) {
      const organizations = await this.listOrganizations(currentUserId);
      const isMember = organizations.some((organization) => organization.id === organizationId);

      if (!isMember) {
        throw new ForbiddenException("Access denied to organization members");
      }

      const memberships = await this.usersRepository.listUsersByOrganization(organizationId);
      return memberships.map((membership) => this.toUserSummary(membership.user));
    }

    const users = await this.usersRepository.listUsersByUserScope(currentUserId);
    return users.map((user) => this.toUserSummary(user));
  }

  toUserSummary(user: { id: string; email: string; name: string; role: "ADMIN" | "USER" }): UserSummaryDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
