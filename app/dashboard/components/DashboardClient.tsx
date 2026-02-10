"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import TasksManager from "./TasksManager";
import MembersManager from "./MembersManager";
import ProjectsManager from "./ProjectsManager";

interface Member {
  id: string;
  name?: string | null;
  email?: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface Team {
  id: string;
  name: string;
  membersCount: number;
  members?: Member[];
  projects?: Project[];
}

interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  project?: {
    id: string;
    name: string;
  };
}

interface MemberWithTeams extends Member {
  teams?: string[];
  teamName?: string;
}

type TabType = "overview" | "projects" | "tasks" | "team";

export default function DashboardClient() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [teams, setTeams] = useState<Team[]>([]);
  const [pendingTasksCount, setPendingTasksCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Error cargando equipos");

      const data = await res.json();
      const teamsData: Team[] = Array.isArray(data.teams) ? data.teams : [];
      setTeams(teamsData);
    } catch (err) {
      console.error(err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingTasks = async () => {
    try {
      const res = await fetch("/api/tasks/me");
      if (res.ok) {
        const tasks = await res.json();
        const pending = tasks.filter((t: { status: string }) => t.status !== "done").length;
        setPendingTasksCount(pending);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadTeams();
      loadPendingTasks();
    }
  }, [session]);

  if (!session) return null;

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-slate-600">Cargando...</p>
          </div>
        </div>
      ) : activeTab === "overview" ? (
        <OverviewTab teams={teams} pendingTasksCount={pendingTasksCount} />
      ) : activeTab === "projects" ? (
        <ProjectsManager
          teams={teams}
          onProjectCreated={loadTeams}
          onProjectDeleted={loadTeams}
        />
      ) : activeTab === "tasks" ? (
        <TasksManager teams={teams} onTaskDeleted={loadTeams} />
      ) : activeTab === "team" ? (
        <MembersManager teams={teams} onMemberDeleted={loadTeams} />
      ) : null}
    </DashboardLayout>
  );
}

// Tab: Resumen general
function OverviewTab({ teams, pendingTasksCount }: { teams: Team[]; pendingTasksCount: number }) {
  const [selectedView, setSelectedView] = useState<"teams" | "projects" | "members" | "tasks">("teams");
  const totalProjects = teams.reduce((sum, t) => sum + (t.projects?.length || 0), 0);
  const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);

  console.log(teams);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Equipos"
          value={teams.length}
          icon="👥"
          color="blue"
          onClick={() => setSelectedView("teams")}
          selected={selectedView === "teams"}
        />
        <StatCard
          label="Proyectos"
          value={totalProjects}
          icon="📁"
          color="green"
          onClick={() => setSelectedView("projects")}
          selected={selectedView === "projects"}
        />
        <StatCard
          label="Miembros"
          value={totalMembers}
          icon="👤"
          color="purple"
          onClick={() => setSelectedView("members")}
          selected={selectedView === "members"}
        />
        <StatCard
          label="Tareas Pendientes"
          value={pendingTasksCount}
          icon="⏳"
          color="blue"
          onClick={() => setSelectedView("tasks")}
          selected={selectedView === "tasks"}
        />
      </div>

      {/* Vista dinámica según selección */}
      <div className="space-y-4">
        {selectedView === "teams" && <TeamsView teams={teams} />}
        {selectedView === "projects" && <ProjectsView teams={teams} />}
        {selectedView === "members" && <MembersView teams={teams} />}
        {selectedView === "tasks" && <TasksView />}
      </div>
    </div>
  );
}

// Componente reutilizable para stats
function StatCard({
  label,
  value,
  icon,
  color,
  onClick,
  selected,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  onClick: () => void;
  selected: boolean;
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 sm:p-6 rounded-lg border transition-all hover:shadow-md ${colorClasses[color as keyof typeof colorClasses]} ${selected ? "ring-2 ring-blue-500 shadow-lg" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <p className="text-slate-600 text-xs sm:text-sm">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <span className="text-3xl sm:text-4xl">{icon}</span>
      </div>
    </button>
  );
}

// Vista de Equipos
function TeamsView({ teams }: { teams: Team[] }) {
  return (
    <>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900">Tus Equipos</h3>
      {teams.length === 0 ? (
        <div className="bg-white p-6 sm:p-8 rounded-lg text-center text-slate-500 border border-slate-200">
          No tienes equipos todavía
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 hover:shadow-lg transition"
            >
              <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
                {team.name}
              </h4>
              <div className="space-y-2 text-sm text-slate-600">
                <p>📁 Proyectos: <span className="font-medium">{team.projects?.length || 0}</span></p>
                <p>👥 Miembros: <span className="font-medium">{team.members?.length || 0}</span></p>
              </div>

              {team.members && team.members.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-700 mb-2">Miembros:</p>
                  <div className="flex flex-wrap gap-1">
                    {team.members.slice(0, 3).map((m) => (
                      <span key={m.id} className="text-xs bg-slate-100 px-2 py-1 rounded truncate max-w-30">
                        {m.name || m.email}
                      </span>
                    ))}
                    {team.members.length > 3 && (
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                        +{team.members.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Vista de Proyectos
function ProjectsView({ teams }: { teams: Team[] }) {
  const allProjects = teams.flatMap((team) =>
    (team.projects || []).map((project) => ({ ...project, teamName: team.name }))
  );

  return (
    <>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900">Todos los Proyectos</h3>
      {allProjects.length === 0 ? (
        <div className="bg-white p-6 sm:p-8 rounded-lg text-center text-slate-500 border border-slate-200">
          No hay proyectos todavía
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {allProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 hover:shadow-lg transition"
            >
              <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                📁 {project.name}
              </h4>
              {project.description && (
                <p className="text-sm text-slate-600 mb-2">{project.description}</p>
              )}
              <p className="text-xs text-slate-500">Equipo: {project.teamName}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Vista de Miembros
function MembersView({ teams }: { teams: Team[] }) {
  const allMembers = teams.flatMap((team) =>
    (team.members || []).map((member) => ({ ...member, teamName: team.name }))
  );

  // Eliminar duplicados (un miembro puede estar en varios equipos)
  const uniqueMembers = allMembers.reduce((acc, member) => {
    const existing = acc.find((m) => m.id === member.id);
    if (existing && member.teamName) {
      existing.teams = [...(existing.teams || (existing.teamName ? [existing.teamName] : [])), member.teamName];
    } else if (member.teamName) {
      acc.push({ ...member, teams: [member.teamName] });
    }
    return acc;
  }, [] as MemberWithTeams[]);

  return (
    <>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900">Todos los Miembros</h3>
      {uniqueMembers.length === 0 ? (
        <div className="bg-white p-6 sm:p-8 rounded-lg text-center text-slate-500 border border-slate-200">
          No hay miembros todavía
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {uniqueMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {member.name || member.email}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  Equipos: {Array.isArray(member.teams) ? member.teams.join(", ") : member.teamName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Vista de Tareas Pendientes
function TasksView() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetch("/api/tasks/me");
        if (res.ok) {
          const data = await res.json();
          setTasks(data.filter((t: TaskData) => t.status !== "done"));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  if (loading) {
    return <p className="text-slate-600">Cargando tareas...</p>;
  }

  return (
    <>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900">Mis Tareas Pendientes</h3>
      {tasks.length === 0 ? (
        <div className="bg-white p-6 sm:p-8 rounded-lg text-center text-slate-500 border border-slate-200">
          No tienes tareas pendientes
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {task.project?.name || "Sin proyecto"}
                    </span>
                    {task.priority && (
                      <span className={`px-2 py-1 rounded ${
                        task.priority === "urgent" ? "bg-red-100 text-red-700" :
                        task.priority === "high" ? "bg-orange-100 text-orange-700" :
                        task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {task.priority}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded ${
                      task.status === "in-progress" ? "bg-yellow-100 text-yellow-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {task.status === "in-progress" ? "En progreso" : "Por hacer"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
