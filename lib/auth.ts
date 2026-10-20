import type { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const providers: AuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Enter your email and password.");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });
      if (!user || !user.password) {
        throw new Error("No account found with that email.");
      }

      const isValid = await bcrypt.compare(credentials.password, user.password);
      if (!isValid) {
        throw new Error("Incorrect password.");
      }

      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
];

// OAuth providers only get registered when their env vars are actually set,
// so the app still runs locally before you've created any OAuth apps.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV !== "production",
  pages: {
    signIn: "/login",
  },
  providers,
  logger: {
    error(code, metadata) {
      console.error("[next-auth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth][warn]", code);
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (!token?.id) return session;

      const stillExists = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { id: true },
      });

      if (!stillExists) {
        // Stale session referencing a user that no longer exists (e.g. after
        // a dev DB reset with a browser cookie still around). Treat as signed out.
        return { ...session, user: undefined } as typeof session;
      }

      (session.user as { id?: string }).id = stillExists.id;
      return session;
    },
  },
};
