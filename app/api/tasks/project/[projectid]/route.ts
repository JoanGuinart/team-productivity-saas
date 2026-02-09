import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    projectid: string;
  }>;
}

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const { projectid: projectId } = await params;

  // Verificar acceso al proyecto
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
    select: { id: true },
  });

  if (!project) {
    return new Response(
      JSON.stringify({ error: "Proyecto no encontrado o sin acceso" }),
      { status: 404 },
    );
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return new Response(JSON.stringify(tasks), { status: 200 });
}
