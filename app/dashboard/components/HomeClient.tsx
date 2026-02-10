"use client";

import { useSession } from "next-auth/react";
import DashboardClient from "./DashboardClient";
import TestLogin from "../../components/TestLogin";
import TestRegister from "../../components/TestRegister";

export default function Home() {
  const { status } = useSession();

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">Team Productivity SaaS</h1>

      {status === "loading" && <p className="text-lg">Cargando...</p>}

      {status === "unauthenticated" && (
        <div className="space-y-6 max-w-md mx-auto">
          <TestRegister />
          <TestLogin />
        </div>
      )}

      {status === "authenticated" && <DashboardClient />}
    </main>
  );
}
