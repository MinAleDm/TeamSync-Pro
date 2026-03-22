import { Injectable } from "@nestjs/common";
import type { OrganizationDto } from "@tracker/types";
import { OrganizationsRepository } from "./organizations.repository";

@Injectable()
export class OrganizationsService {
  constructor(private readonly organizationsRepository: OrganizationsRepository) {}

  async listForUser(userId: string): Promise<OrganizationDto[]> {
    const memberships = await this.organizationsRepository.listForUser(userId);

    return memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
    }));
  }
}
