import { hash } from "bcryptjs";
import { prisma, TaskPriority, TaskStatus, UserRole } from "../src";

async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? "owner@tracker.local";
  const password = process.env.DEMO_USER_PASSWORD ?? "changeme123";
  const passwordHash = await hash(password, 10);

  const owner = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Tracker Owner",
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      email,
      name: "Tracker Owner",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const engineer = await prisma.user.upsert({
    where: { email: "engineer@tracker.local" },
    update: {
      name: "Nina Engineer",
      passwordHash,
    },
    create: {
      email: "engineer@tracker.local",
      name: "Nina Engineer",
      passwordHash,
    },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: "acme-platform" },
    update: {
      name: "Acme Platform",
    },
    create: {
      name: "Acme Platform",
      slug: "acme-platform",
    },
  });

  await prisma.organizationMembership.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: owner.id,
      },
    },
    update: {
      role: "OWNER",
    },
    create: {
      organizationId: organization.id,
      userId: owner.id,
      role: "OWNER",
    },
  });

  await prisma.organizationMembership.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: engineer.id,
      },
    },
    update: {
      role: "MEMBER",
    },
    create: {
      organizationId: organization.id,
      userId: engineer.id,
      role: "MEMBER",
    },
  });

  const project = await prisma.project.upsert({
    where: {
      organizationId_key: {
        organizationId: organization.id,
        key: "CORE",
      },
    },
    update: {
      name: "Core Platform",
      description: "Realtime task orchestration for the platform team.",
    },
    create: {
      organizationId: organization.id,
      key: "CORE",
      name: "Core Platform",
      description: "Realtime task orchestration for the platform team.",
    },
  });

  const taskCount = await prisma.task.count({
    where: { projectId: project.id },
  });

  if (taskCount === 0) {
    const task = await prisma.task.create({
      data: {
        projectId: project.id,
        creatorId: owner.id,
        assigneeId: engineer.id,
        title: "Ship task activity stream",
        description: "Persist task updates and broadcast them to connected clients.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
      },
    });

    await prisma.taskComment.create({
      data: {
        taskId: task.id,
        authorId: owner.id,
        body: "Let’s keep the first cut focused on task updates and comments.",
      },
    });

    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        actorId: owner.id,
        action: "task.created",
        afterValue: "Initial task created from seed data",
      },
    });
  }

  console.info(`Seeded demo data. Login: ${email} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
