import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.organizationMembership.findMany({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: {
        organization: {
          name: "asc",
        },
      },
    });
  }
}
