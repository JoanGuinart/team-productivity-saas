import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
      });
    }

    // Obtener equipos donde el usuario es miembro
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: { user: true }, // para ver info de los usuarios
        },
        projects: true, // opcional, ver proyectos del equipo
      },
    });

    return new Response(JSON.stringify(teams), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
}
