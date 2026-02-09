import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
      });
    }

    const { teamId, userId, role } = await req.json();

    if (!teamId || !userId) {
      return new Response(JSON.stringify({ error: "Faltan datos" }), {
        status: 400,
      });
    }

    // Verificar que el usuario que se quiere agregar existe
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userToAdd) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 404,
      });
    }

    // Verificar que el equipo existe
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return new Response(JSON.stringify({ error: "Equipo no encontrado" }), {
        status: 404,
      });
    }

    // Verificar que el usuario no esté ya en el equipo
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (existingMember) {
      return new Response(
        JSON.stringify({ error: "Este usuario ya es miembro del equipo" }),
        { status: 400 },
      );
    }

    // Agregar al miembro
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role: role || "member",
      },
    });

    return new Response(JSON.stringify(member), { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Error interno";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500 },
    );
  }
}
