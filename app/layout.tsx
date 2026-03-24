import "./globals.css";
import Providers from "./providers";
import DemoReadonlyBanner from "./components/DemoReadonlyBanner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDemoReadonly = process.env.DEMO_READONLY === "true";

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-300 text-gray-900">
        {isDemoReadonly ? <DemoReadonlyBanner /> : null}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
