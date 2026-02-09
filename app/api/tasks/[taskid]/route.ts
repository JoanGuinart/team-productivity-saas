import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    taskid: string;
  }>;
}

// DELETE - Borrar tarea
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const { taskid: taskId } = await params;

  // Obtener tarea y verificar acceso
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        team: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    },
  });

  if (!task) {
    return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
      status: 404,
    });
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

// PATCH - Actualizar tarea (status, assignee, etc)
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const { taskid: taskId } = await params;
  const body = await req.json();
  const { status, assigneeId, title, description, priority, dueDate } = body;

  // Obtener tarea y verificar acceso
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        team: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    },
    include: {
      project: {
        select: {
          teamId: true,
        },
      },
    },
  });

  if (!task) {
    return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
      status: 404,
    });
  }

  // Validar assignee si se proporciona
  if (assigneeId) {
    const member = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: assigneeId,
          teamId: task.project.teamId,
        },
      },
    });

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Asignado no pertenece al equipo" }),
        { status: 400 },
      );
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(status && { status }),
      ...(assigneeId && { assigneeId }),
      ...(assigneeId === null && { assigneeId: null }),
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(priority && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return new Response(JSON.stringify(updatedTask), { status: 200 });
}
