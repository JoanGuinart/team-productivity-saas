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

type TabType = "overview" | "projects" | "tasks" | "team";

export default function DashboardClient() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [teams, setTeams] = useState<Team[]>([]);
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

  useEffect(() => {
    if (session?.user?.id) loadTeams();
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
        <OverviewTab teams={teams} />
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
function OverviewTab({ teams }: { teams: Team[] }) {
  const totalProjects = teams.reduce((sum, t) => sum + (t.projects?.length || 0), 0);
  const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Equipos"
          value={teams.length}
          icon="👥"
          color="blue"
        />
        <StatCard
          label="Proyectos"
          value={totalProjects}
          icon="📁"
          color="green"
        />
        <StatCard
          label="Miembros"
          value={totalMembers}
          icon="👤"
          color="purple"
        />
      </div>

      {/* Equipos detallados */}
      <div className="space-y-4">
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

                {/* Quick preview de miembros */}
                {team.members && team.members.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-700 mb-2">Miembros:</p>
                    <div className="flex flex-wrap gap-1">
                      {team.members.slice(0, 3).map((m) => (
                        <span key={m.id} className="text-xs bg-slate-100 px-2 py-1 rounded truncate max-w-[120px]">
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
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
  };

  return (
    <div
      className={`p-4 sm:p-6 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-xs sm:text-sm">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <span className="text-3xl sm:text-4xl">{icon}</span>
      </div>
    </div>
  );
}
