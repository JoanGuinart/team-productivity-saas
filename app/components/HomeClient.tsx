"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Dashboard from "./Dashboard";
import LogoutButton from "./SignOut";
import TestCreateTeam from "./TestCreateTeam";
import TestListTeams from "./TestListTeams";
import TestLogin from "./TestLogin";
import TestRegister from "./TestRegister";
import TestAddMember from "./TestAddMember";

export default function HomeClient() {
  const [teamsRefreshToken, setTeamsRefreshToken] = useState(0);
  const { status } = useSession();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Team Productivity SaaS</h1>
      
      {status === "unauthenticated" && (
        <>
          <TestRegister />
          <TestLogin />
        </>
      )}

      {status === "authenticated" && (
        <>
          <Dashboard />
          <LogoutButton />
          <TestCreateTeam onCreated={() => setTeamsRefreshToken((v) => v + 1)} />
          <TestListTeams refreshToken={teamsRefreshToken} />
          <TestAddMember />
        </>
      )}

      {status === "loading" && <p>Cargando...</p>}
    </main>
  );
}
