const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function upsertUser({ email, name, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
    },
    create: {
      email,
      name,
      password: hashedPassword,
    },
  });
}

async function ensureTeam(name) {
  const existing = await prisma.team.findFirst({
    where: { name },
  });

  if (existing) {
    return existing;
  }

  return prisma.team.create({
    data: { name },
  });
}

async function ensureProject({ teamId, name, description }) {
  const existing = await prisma.project.findFirst({
    where: {
      teamId,
      name,
    },
  });

  if (existing) {
    return prisma.project.update({
      where: { id: existing.id },
      data: { description },
    });
  }

  return prisma.project.create({
    data: {
      teamId,
      name,
      description,
    },
  });
}

async function ensureTask({ projectId, assigneeId, title, description, status, priority, dueDate }) {
  const existing = await prisma.task.findFirst({
    where: {
      projectId,
      title,
    },
  });

  const payload = {
    projectId,
    assigneeId,
    title,
    description,
    status,
    priority,
    dueDate,
  };

  if (existing) {
    return prisma.task.update({
      where: { id: existing.id },
      data: payload,
    });
  }

  return prisma.task.create({
    data: payload,
  });
}

async function run() {
  const confirmArg = process.argv.find((arg) => arg.startsWith("--confirm="));
  const confirmValue = confirmArg ? confirmArg.split("=")[1] : null;
  const isConfirmed =
    process.env.DEMO_SEED_CONFIRM === "yes" || confirmValue === "yes";

  if (!isConfirmed) {
    throw new Error(
      "Seed cancelado. Usa DEMO_SEED_CONFIRM=yes o npm run seed:demo -- --confirm=yes",
    );
  }

  const demoPassword = process.env.DEMO_USER_PASSWORD || "demo1234";

  const adminUser = await upsertUser({
    email: "demo.admin@taskflow.local",
    name: "Demo Admin",
    password: demoPassword,
  });

  const memberUser = await upsertUser({
    email: "demo.member@taskflow.local",
    name: "Demo Member",
    password: demoPassword,
  });

  const team = await ensureTeam("Portfolio Demo Team");

  await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: adminUser.id,
        teamId: team.id,
      },
    },
    update: { role: "admin" },
    create: {
      userId: adminUser.id,
      teamId: team.id,
      role: "admin",
    },
  });

  await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: memberUser.id,
        teamId: team.id,
      },
    },
    update: { role: "member" },
    create: {
      userId: memberUser.id,
      teamId: team.id,
      role: "member",
    },
  });

  const projectA = await ensureProject({
    teamId: team.id,
    name: "Launch Website",
    description: "Landing y onboarding para la version demo.",
  });

  const projectB = await ensureProject({
    teamId: team.id,
    name: "Mobile Improvements",
    description: "Ajustes UX para mostrar gestion real de backlog.",
  });

  await ensureTask({
    projectId: projectA.id,
    assigneeId: adminUser.id,
    title: "Definir contenido hero",
    description: "Copys finales y CTA para portada.",
    status: "done",
    priority: "high",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  });

  await ensureTask({
    projectId: projectA.id,
    assigneeId: memberUser.id,
    title: "Configurar formulario contacto",
    description: "Validaciones y mensajes de error.",
    status: "in-progress",
    priority: "medium",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });

  await ensureTask({
    projectId: projectA.id,
    assigneeId: null,
    title: "Crear test e2e del login",
    description: "Cobertura minima del flujo de acceso.",
    status: "todo",
    priority: "urgent",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await ensureTask({
    projectId: projectB.id,
    assigneeId: memberUser.id,
    title: "Auditar navegacion movil",
    description: "Detectar pantallas con overflow y cortar deuda UX.",
    status: "in-progress",
    priority: "high",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });

  await ensureTask({
    projectId: projectB.id,
    assigneeId: adminUser.id,
    title: "Revisar metricas de adopcion",
    description: "Preparar insights para demo de portfolio.",
    status: "todo",
    priority: "low",
    dueDate: null,
  });

  console.log("Demo seed completado.");
  console.log("Usuario demo admin: demo.admin@taskflow.local");
  console.log("Usuario demo member: demo.member@taskflow.local");
  console.log(`Password demo: ${demoPassword}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
