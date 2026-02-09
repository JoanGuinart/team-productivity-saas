import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    teamid: string;
    userid: string;
  }>;
}

// DELETE - Borrar miembro del equipo
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const { teamid: teamId, userid: userId } = await params;

  // Verificar que el usuario es miembro del equipo
  const currentMember = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId: session.user.id,
        teamId,
      },
    },
  });

  if (!currentMember) {
    return new Response(
      JSON.stringify({ error: "No perteneces a este equipo" }),
      { status: 403 },
    );
  }

  // Verificar que el miembro a borrar existe
  const memberToDelete = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  if (!memberToDelete) {
    return new Response(
      JSON.stringify({ error: "Miembro no encontrado en el equipo" }),
      { status: 404 },
    );
  }

  // No permitir borrar al único admin o a uno mismo (opcional)
  // Por ahora simplemente lo borramos

  await prisma.teamMember.delete({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
