import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isDemoReadonly } from "@/lib/demoMode";
import { getDemoMyTasks } from "@/lib/demoData";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  if (isDemoReadonly()) {
    return new Response(JSON.stringify(getDemoMyTasks(session.user.id)), {
      status: 200,
    });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return new Response(JSON.stringify(tasks), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error cargando tareas" }), {
      status: 500,
    });
  }
}
