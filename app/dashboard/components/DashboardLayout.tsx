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
  const activeTabLabel = tabs.find((t) => t.id === activeTab)?.label;

  return (
    <div className="flex min-h-screen bg-slate-100 overflow-hidden">
      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[86vw] flex-col overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/Brand */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-700 px-4 py-5">
          <div>
            <span className="block text-xl font-bold">TaskFlow</span>
            <span className="text-xs text-slate-400">Workspace personal</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 transition hover:bg-slate-700 lg:hidden"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="shrink-0 border-b border-slate-700 px-4 py-4">
          <p className="mb-1 text-xs text-slate-400">Usuario</p>
          <p className="text-sm font-medium truncate">{session?.user?.email || "Invitado"}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 space-y-2 overflow-y-auto px-3 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id as "overview" | "projects" | "tasks" | "team");
                setMobileMenuOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
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
        <div className="shrink-0 border-t border-slate-700 p-4">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 w-full lg:w-auto">
        <div className="flex min-h-screen flex-col">
          {/* Top Header */}
          <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 lg:hidden">
                  TaskFlow Demo
                </p>
                <h1 className="truncate pr-2 text-xl font-bold text-slate-900 sm:text-2xl">
                  {activeTabLabel}
                </h1>
              </div>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-800 shadow-sm transition hover:bg-slate-50 lg:hidden"
                aria-label="Open menu"
              >
                ☰
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-8">
            {children}
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as "overview" | "projects" | "tasks" | "team")}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span>{tab.label.replace(/^[^\s]+\s/, "")}</span>
              </button>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}
