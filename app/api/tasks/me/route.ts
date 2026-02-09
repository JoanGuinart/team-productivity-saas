import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

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
}
