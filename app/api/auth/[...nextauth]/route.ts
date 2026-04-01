import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isDemoReadonly } from "@/lib/demoMode";
import { DEMO_USER } from "@/lib/demoData";

// Extiende los tipos de Session para incluir user.id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
  }
}

// Interface para las credenciales
interface Credentials {
  email: string;
  password: string;
}

// Configuración de NextAuth
export const authOptions: AuthOptions = {
  ...(isDemoReadonly() ? {} : { adapter: PrismaAdapter(prisma) }),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Credentials | undefined) {
        if (!credentials?.email || !credentials.password) return null;

        if (isDemoReadonly()) {
          const emailMatches =
            credentials.email.toLowerCase() === DEMO_USER.email.toLowerCase();
          const passwordMatches = credentials.password === DEMO_USER.password;

          if (!emailMatches || !passwordMatches) {
            return null;
          }

          return {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            name: DEMO_USER.name,
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // ruta de login personalizada (opcional)
    error: "/auth/error", // ruta de error personalizada (opcional)
  },
};

// Exporta para Next.js App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
