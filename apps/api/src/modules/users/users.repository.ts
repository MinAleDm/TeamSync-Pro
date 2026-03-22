import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  listOrganizations(userId: string) {
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

  listUsersByOrganization(organizationId: string) {
    return this.prisma.organizationMembership.findMany({
      where: { organizationId },
      include: {
        user: true,
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });
  }

  listUsersByUserScope(userId: string) {
    return this.prisma.user.findMany({
      where: {
        memberships: {
          some: {
            organization: {
              memberships: {
                some: {
                  userId,
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
