import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ teams: [] }), { status: 200 });
    }

    // Obtener los equipos donde el usuario es miembro
    const teams = await prisma.teamMember.findMany({
      where: { userId: session.user.id },
      include: { 
        team: { 
          include: { 
            members: { include: { user: true } }, // ✅ Incluir user data de cada member
            projects: { orderBy: { createdAt: "desc" } }
          } 
        } 
      },
    });

    // Formatear datos para el frontend
    const formattedTeams = teams.map(({ team }) => ({
      id: team.id,
      name: team.name,
      membersCount: team.members.length,
      projects: team.projects.map(p => ({ id: p.id, name: p.name })),
      members: team.members.map(m => ({ 
        id: m.user.id, 
        name: m.user.name, 
        email: m.user.email, 
        role: m.role 
      })), // ✅ Incluir miembros formateados
    }));

    return new Response(JSON.stringify({ teams: formattedTeams }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ teams: [] }), { status: 500 });
  }
}
