import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import ProjectsList from "./components/ProjectsList";
import MyTasksList from "./components/MyTasksList";
import NewTaskForm from "./components/NewTaskForm";

interface DashboardProject {
  id: string;
  name: string;
  tasks: { id: string }[];
}

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  project: {
    name: string;
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <p>No autorizado. Por favor, inicia sesión.</p>;
  }

  const userId = session.user.id;

  // Fetch proyectos donde el usuario está
  const projects: DashboardProject[] = await prisma.project.findMany({
    where: {
      team: {
        members: {
          some: { userId },
        },
      },
    },
    select: {
      id: true,
      name: true,
      tasks: {
        select: {
          id: true,
        },
      },
    },
  });

  // Fetch tareas asignadas
  const myTasks: DashboardTask[] = await prisma.task.findMany({
    where: { assigneeId: userId },
    select: {
      id: true,
      title: true,
      status: true,
      project: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const newTaskProjects = projects.map(
    (project: DashboardProject) => ({ id: project.id, name: project.name }),
  );

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <ProjectsList projects={projects} />
      <MyTasksList tasks={myTasks} />

      <NewTaskForm projects={newTaskProjects} />
    </main>
  );
}
