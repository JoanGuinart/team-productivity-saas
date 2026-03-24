import HomeClient from "./dashboard/components/HomeClient";

export default function Home() {
  return (
    <HomeClient
      demoConfig={{
        isDemoReadonly: process.env.DEMO_READONLY === "true",
        demoEmail:
          process.env.DEMO_LOGIN_EMAIL ||
          process.env.NEXT_PUBLIC_DEMO_LOGIN_EMAIL ||
          "demo.admin@taskflow.local",
        demoPassword:
          process.env.DEMO_USER_PASSWORD ||
          process.env.NEXT_PUBLIC_DEMO_LOGIN_PASSWORD ||
          "demo1234",
      }}
    />
  );
}
