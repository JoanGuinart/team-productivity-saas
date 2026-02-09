import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface AssignTaskBody {
  taskId: string;
  assigneeId: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const body: AssignTaskBody = await req.json();
  const { taskId, assigneeId } = body;

  if (!taskId || !assigneeId) {
    return new Response(JSON.stringify({ error: "Faltan datos" }), {
      status: 400,
    });
  }

  // Obtener la tarea con el proyecto
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
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

  // Verificar que el usuario asignado pertenece al equipo
  const assigneeMember = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: assigneeId,
        teamId: task.project.teamId,
      },
    },
  });

  if (!assigneeMember) {
    return new Response(
      JSON.stringify({ error: "El usuario no pertenece al equipo" }),
      { status: 403 },
    );
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      assigneeId,
    },
  });

  return new Response(JSON.stringify(updatedTask), { status: 200 });
}
