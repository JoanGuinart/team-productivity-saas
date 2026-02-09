import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    projectid: string;
  }>;
}

// DELETE - Borrar proyecto
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const { projectid: projectId } = await params;

  // Verificar que el usuario es miembro del equipo propietario del proyecto
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      team: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  if (!project) {
    return new Response(JSON.stringify({ error: "Proyecto no encontrado" }), {
      status: 404,
    });
  }

  // Borrar todas las tareas del proyecto primero
  await prisma.task.deleteMany({
    where: { projectId },
  });

  // Luego borrar el proyecto
  await prisma.project.delete({
    where: { id: projectId },
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
