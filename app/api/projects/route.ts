import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return new Response(JSON.stringify({ error: "teamId requerido" }), {
      status: 400,
    });
  }

  // Verificar que el usuario pertenece al equipo
  const member = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: session.user.id,
        teamId,
      },
    },
  });

  if (!member) {
    return new Response(JSON.stringify({ error: "Acceso denegado" }), {
      status: 403,
    });
  }

  const projects = await prisma.project.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });

  return new Response(JSON.stringify(projects), { status: 200 });
}
