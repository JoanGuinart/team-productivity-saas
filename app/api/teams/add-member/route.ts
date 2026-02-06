import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
      });
    }

    const { teamId, userEmail, role } = await req.json();

    if (!teamId || !userEmail) {
      return new Response(JSON.stringify({ error: "Faltan datos" }), {
        status: 400,
      });
    }

    // Verificar que el usuario que se quiere agregar existe
    const userToAdd = await prisma.user.findUnique({
      where: { email: userEmail },
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

    // Agregar al miembro (si ya existe, Prisma lanzará error por la constraint unique)
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId: userToAdd.id,
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
