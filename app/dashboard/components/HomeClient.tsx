"use client";

import { useSession } from "next-auth/react";
import DashboardClient from "./DashboardClient";
import TestLogin from "../../components/TestLogin";
import TestRegister from "../../components/TestRegister";

interface DemoConfig {
  isDemoReadonly: boolean;
  demoEmail: string;
  demoPassword: string;
}

export default function Home({ demoConfig }: { demoConfig: DemoConfig }) {
  const { status } = useSession();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 sm:mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Team Productivity SaaS
          </p>
        </div>

        {status === "loading" && <p className="text-lg">Cargando...</p>}

        {status === "unauthenticated" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,28rem)] lg:items-start">
            <section className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-900 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                    Multi-team
                  </p>
                  <p className="mt-3 text-sm text-slate-200">
                    Organiza equipos, proyectos y miembros en un solo panel.
                  </p>
                </div>
                <div className="rounded-2xl bg-blue-600 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-100">
                    Kanban
                  </p>
                  <p className="mt-3 text-sm text-blue-50">
                    Gestiona estados y prioridades con foco en tareas activas.
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-500 p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-50">
                    Demo
                  </p>
                  <p className="mt-3 text-sm text-emerald-50">
                    Explora el producto sin tocar datos reales ni escribir en
                    producción.
                  </p>
                </div>
              </div>
            </section>

            <div className="space-y-6 max-w-md lg:max-w-none mx-auto w-full">
              {!demoConfig.isDemoReadonly ? <TestRegister /> : null}
              <TestLogin demoConfig={demoConfig} />
            </div>
          </div>
        )}

        {status === "authenticated" && <DashboardClient />}
      </div>
    </main>
  );
}
