import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

// NextAuth v4 handler is a single function that handles all HTTP methods
// We need to export it as both GET and POST for Next.js App Router
export async function GET(request: Request, context: unknown) {
  return (handler as Function)(request, context);
}

export async function POST(request: Request, context: unknown) {
  return (handler as Function)(request, context);
}
