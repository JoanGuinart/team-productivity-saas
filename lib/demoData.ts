type DemoMember = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
};

type DemoTask = {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  projectId: string;
  projectName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  dueDate?: string;
  createdAt: string;
};

type DemoProject = {
  id: string;
  name: string;
  description?: string;
  tasks: DemoTask[];
};

type DemoTeam = {
  id: string;
  name: string;
  members: DemoMember[];
  projects: DemoProject[];
};

export const DEMO_USER = {
  id: "demo-user-1",
  email:
    process.env.DEMO_LOGIN_EMAIL ||
    process.env.NEXT_PUBLIC_DEMO_LOGIN_EMAIL ||
    "demo.admin@taskflow.local",
  password:
    process.env.DEMO_USER_PASSWORD ||
    process.env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD ||
    "demo1234",
  name: "Demo Admin",
};

const membersCore: DemoMember[] = [
  {
    id: DEMO_USER.id,
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    role: "admin",
  },
  {
    id: "demo-user-2",
    name: "Marta Lopez",
    email: "marta@taskflow.local",
    role: "member",
  },
  {
    id: "demo-user-3",
    name: "Sergio Ruiz",
    email: "sergio@taskflow.local",
    role: "member",
  },
  {
    id: "demo-user-4",
    name: "Lina Perez",
    email: "lina@taskflow.local",
    role: "member",
  },
];

const nowIso = new Date().toISOString();

const demoTeams: DemoTeam[] = [
  {
    id: "demo-team-1",
    name: "Producto",
    members: membersCore.slice(0, 3),
    projects: [
      {
        id: "demo-project-1",
        name: "Portal Clientes",
        description: "Rediseno de onboarding y seguimiento de tickets",
        tasks: [
          {
            id: "demo-task-1",
            title: "Definir flujo de alta",
            description: "Mapear pasos y validaciones del nuevo signup",
            status: "todo",
            priority: "high",
            projectId: "demo-project-1",
            projectName: "Portal Clientes",
            assigneeId: "demo-user-1",
            assigneeName: "Demo Admin",
            assigneeEmail: DEMO_USER.email,
            dueDate: nowIso,
            createdAt: nowIso,
          },
          {
            id: "demo-task-2",
            title: "Revisar copy de dashboard",
            status: "in-progress",
            priority: "medium",
            projectId: "demo-project-1",
            projectName: "Portal Clientes",
            assigneeId: "demo-user-2",
            assigneeName: "Marta Lopez",
            assigneeEmail: "marta@taskflow.local",
            createdAt: nowIso,
          },
        ],
      },
    ],
  },
  {
    id: "demo-team-2",
    name: "Marketing",
    members: [membersCore[0], membersCore[3]],
    projects: [
      {
        id: "demo-project-2",
        name: "Campana Q2",
        description: "Calendario de contenidos y assets de lanzamiento",
        tasks: [
          {
            id: "demo-task-3",
            title: "Preparar calendario social",
            status: "todo",
            priority: "urgent",
            projectId: "demo-project-2",
            projectName: "Campana Q2",
            assigneeId: "demo-user-1",
            assigneeName: "Demo Admin",
            assigneeEmail: DEMO_USER.email,
            createdAt: nowIso,
          },
          {
            id: "demo-task-4",
            title: "Coordinar creatividades",
            status: "done",
            priority: "low",
            projectId: "demo-project-2",
            projectName: "Campana Q2",
            assigneeId: "demo-user-4",
            assigneeName: "Lina Perez",
            assigneeEmail: "lina@taskflow.local",
            createdAt: nowIso,
          },
        ],
      },
    ],
  },
];

export function getDemoDashboardTeams() {
  return demoTeams.map((team) => ({
    id: team.id,
    name: team.name,
    membersCount: team.members.length,
    projects: team.projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
    })),
    members: team.members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
    })),
  }));
}

export function getDemoMyTasks(userId: string) {
  return demoTeams
    .flatMap((team) => team.projects)
    .flatMap((project) => project.tasks)
    .filter((task) => task.assigneeId === userId)
    .map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      project: {
        id: task.projectId,
        name: task.projectName,
      },
      assignee: {
        id: task.assigneeId,
        name: task.assigneeName,
        email: task.assigneeEmail,
      },
    }));
}

export function getDemoProjectTasks(projectId: string) {
  const project = demoTeams
    .flatMap((team) => team.projects)
    .find((item) => item.id === projectId);

  if (!project) {
    return null;
  }

  return project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    projectId: task.projectId,
    assigneeId: task.assigneeId,
    assignee: {
      id: task.assigneeId,
      name: task.assigneeName,
      email: task.assigneeEmail,
    },
  }));
}

export function searchDemoUsers(search: string, teamId?: string | null) {
  const term = search.trim().toLowerCase();
  const allMembers = demoTeams
    .flatMap((team) => team.members)
    .reduce<DemoMember[]>((acc, member) => {
      if (!acc.some((item) => item.id === member.id)) {
        acc.push(member);
      }
      return acc;
    }, []);

  const matches = allMembers.filter((user) => {
    if (!term) return true;
    return (
      user.email.toLowerCase().includes(term) ||
      user.name.toLowerCase().includes(term)
    );
  });

  if (!teamId) {
    return matches.map(({ id, email, name }) => ({ id, email, name }));
  }

  const team = demoTeams.find((item) => item.id === teamId);
  const excluded = new Set((team?.members || []).map((member) => member.id));

  return matches
    .filter((user) => !excluded.has(user.id))
    .map(({ id, email, name }) => ({ id, email, name }));
}
