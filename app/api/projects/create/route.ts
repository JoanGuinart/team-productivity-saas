import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface CreateProjectBody {
  name: string;
  description?: string;
  teamId: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const body: CreateProjectBody = await req.json();
  const { name, description, teamId } = body;

  if (!name || !teamId) {
    return new Response(JSON.stringify({ error: "Faltan datos" }), {
      status: 400,
    });
  }

  // Verificar que el usuario es miembro del equipo
  const member = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: session.user.id,
        teamId,
      },
    },
  });

  if (!member) {
    return new Response(
      JSON.stringify({ error: "No eres miembro del equipo" }),
      {
        status: 403,
      },
    );
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      teamId,
    },
  });

  return new Response(JSON.stringify(project), { status: 201 });
}
