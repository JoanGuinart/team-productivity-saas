import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teamid?: string }> }, // params es Promise en Next.js 15+
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
      });
    }

    const { teamid: teamId } = await params; // await params

    if (!teamId) {
      return new Response(
        JSON.stringify({ error: "teamId no proporcionado" }),
        {
          status: 400,
        },
      );
    }

    // Verifica que el equipo existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { include: { user: true } } },
    });

    if (!team) {
      return new Response(JSON.stringify({ error: "Equipo no encontrado" }), {
        status: 404,
      });
    }

    // Mapea los miembros a datos simples
    const members = team.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    }));

    return new Response(JSON.stringify({ members }), { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error interno",
      }),
      { status: 500 },
    );
  }
}
