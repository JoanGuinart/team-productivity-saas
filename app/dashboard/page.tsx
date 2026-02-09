import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import ProjectsList from "./components/ProjectsList";
import MyTasksList from "./components/MyTasksList";
import NewTaskForm from "./components/NewTaskForm";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <p>No autorizado. Por favor, inicia sesión.</p>;
  }

  const userId = session.user.id;

  // Fetch proyectos donde el usuario está
  const projects = await prisma.project.findMany({
    where: {
      team: {
        members: {
          some: { userId },
        },
      },
    },
    include: {
      tasks: true,
    },
  });

  // Fetch tareas asignadas
  const myTasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-8 space-y-8">
  <h1 className="text-3xl font-bold">Dashboard</h1>

  <ProjectsList projects={projects} />
  <MyTasksList tasks={myTasks} />

  <NewTaskForm projects={projects.map((p) => ({ id: p.id, name: p.name }))} />
</main>
  );
}
