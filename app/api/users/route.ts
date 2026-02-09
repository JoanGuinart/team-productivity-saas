import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Listar usuarios (buscar por email o nombre)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const teamId = searchParams.get("teamId");

  try {
    // Buscar usuarios por email o nombre
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
      take: 10, // Limitar a 10 resultados
    });

    // Si se proporciona teamId, excluir miembros ya en el equipo
    if (teamId) {
      const existingMembers = await prisma.teamMember.findMany({
        where: { teamId },
        select: { userId: true },
      });

      const existingUserIds = existingMembers.map((m) => m.userId);

      const filteredUsers = users.filter(
        (user) => !existingUserIds.includes(user.id)
      );

      return new Response(JSON.stringify(filteredUsers), { status: 200 });
    }

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error buscando usuarios" }), {
      status: 500,
    });
  }
}
