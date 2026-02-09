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

    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return new Response(
        JSON.stringify({ error: "El nombre del equipo es obligatorio" }),
        {
          status: 400,
        },
      );
    }

    // Crear el equipo
    const team = await prisma.team.create({
      data: {
        name,
        members: {
          create: {
            userId: session.user.id,
            role: "admin", // el creador es admin
          },
        },
      },
      include: {
        members: true,
      },
    });

    return new Response(JSON.stringify(team), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
}
