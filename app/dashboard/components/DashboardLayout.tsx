"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "../../components/SignOut";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: "overview" | "projects" | "tasks" | "team";
  onTabChange: (tab: "overview" | "projects" | "tasks" | "team") => void;
}

const tabs = [
  { id: "overview", label: "📊 Resumen", icon: "📊" },
  { id: "projects", label: "📁 Proyectos", icon: "📁" },
  { id: "tasks", label: "✅ Tareas", icon: "✅" },
  { id: "team", label: "👥 Equipo", icon: "👥" },
];

export default function DashboardLayout({
  children,
  activeTab,
  onTabChange,
}: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 h-screen overflow-hidden flex flex-col shadow-lg`}
      >
        {/* Logo/Brand */}
        <div className="flex-shrink-0 p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && <span className="font-bold text-lg">TaskFlow</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-700 rounded transition"
          >
            {sidebarOpen ? "◄" : "►"}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="flex-shrink-0 px-4 py-3 border-b border-slate-700">
            <p className="text-sm text-slate-300">Usuario</p>
            <p className="text-sm font-medium truncate">{session?.user?.email}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as "overview" | "projects" | "tasks" | "team")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {sidebarOpen && <span className="text-sm">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="flex-shrink-0 p-4 border-t border-slate-700">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 transition-all">
        <div className="h-screen flex flex-col">
          {/* Top Header */}
          <div className="bg-white border-b border-slate-200 shadow-sm">
            <div className="px-8 py-4">
              <h1 className="text-2xl font-bold text-slate-900">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
