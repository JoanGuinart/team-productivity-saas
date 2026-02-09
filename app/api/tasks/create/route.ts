import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface CreateTaskBody {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  priority?: string;
  dueDate?: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const body: CreateTaskBody = await req.json();
  const { title, description, projectId, assigneeId, priority, dueDate } = body;

  if (!title || !projectId) {
    return new Response(JSON.stringify({ error: "Faltan datos" }), {
      status: 400,
    });
  }

  // Obtener el proyecto con su equipo
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { teamId: true },
  });

  if (!project) {
    return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), {
      status: 404,
    });
  }

  // Verificar que el usuario pertenece al equipo del proyecto
  const member = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: session.user.id,
        teamId: project.teamId,
      },
    },
  });

  if (!member) {
    return new Response(JSON.stringify({ error: "Acceso denegado" }), {
      status: 403,
    });
  }

  // Validar que el assignee (si existe) pertenece al equipo
  if (assigneeId) {
    const assignee = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: assigneeId,
          teamId: project.teamId,
        },
      },
    });

    if (!assignee) {
      return new Response(
        JSON.stringify({ error: "El asignado no pertenece al equipo" }),
        { status: 400 },
      );
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assigneeId: assigneeId || null,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "todo",
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return new Response(JSON.stringify(task), { status: 201 });
}
