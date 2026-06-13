import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
};

export default NextAuth(authOptions);

export async function auth(): Promise<Session | null> {
  // TEMPORARILY DISABLED: NextAuth session resolution is commented out so the
  // app deploys/loads without OAuth + NEXTAUTH_SECRET configured. Re-enable the
  // block below once the env vars are set in the deployment.
  void getServerSession;
  return null;

  // try {
  //   return await getServerSession(authOptions);
  // } catch (error) {
  //   console.error("auth() failed to resolve session:", error);
  //   return null;
  // }
}
