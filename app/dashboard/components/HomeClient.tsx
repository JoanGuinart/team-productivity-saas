"use client";

import { useSession } from "next-auth/react";
import DashboardClient from "./DashboardClient";
import TestLogin from "../../components/TestLogin";
import TestRegister from "../../components/TestRegister";

export default function Home() {
  const { status } = useSession();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Team Productivity SaaS</h1>

      {status === "loading" && <p>Cargando...</p>}

      {status === "unauthenticated" && (
        <>
          <TestRegister />
          <TestLogin />
        </>
      )}

      {status === "authenticated" && <DashboardClient />}
    </main>
  );
}
