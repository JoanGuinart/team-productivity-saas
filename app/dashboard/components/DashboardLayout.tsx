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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen overflow-hidden flex flex-col shadow-lg
        fixed lg:static z-40 transition-transform duration-300 ease-in-out -left-64 lg:left-0 ${
          mobileMenuOpen ? "translate-x-64" : "translate-x-0"
        }`}
      >
        {/* Logo/Brand */}
        <div className="flex-shrink-0 p-4 border-b border-slate-700 flex items-center justify-between">
          <span className="font-bold text-xl">TaskFlow</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-700 rounded transition"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Usuario</p>
          <p className="text-sm font-medium truncate">{session?.user?.email || "Invitado"}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id as "overview" | "projects" | "tasks" | "team");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="flex-shrink-0 p-4 border-t border-slate-700">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-auto min-w-0">
        <div className="h-screen flex flex-col">
          {/* Top Header */}
          <div className="bg-white border-b border-slate-200 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 pl-12 lg:pl-0">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
