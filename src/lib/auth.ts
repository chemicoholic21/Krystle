import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import type { NextAuthOptions, Session } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // Persist users, accounts and sessions in Postgres via Prisma.
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "database" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    Google({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Expose the database user id on the session so server components and
    // API routes can scope queries with session.user.id.
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

export async function auth(): Promise<Session | null> {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("auth() failed to resolve session:", error);
    return null;
  }
}
