import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { careerCoach } from "@/services/ai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question } = await req.json();

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }

  const response = await careerCoach(question, {
    skills: profile.skills as string[],
    experienceLevel: profile.experienceLevel || "STUDENT",
    desiredRoles: profile.desiredRoles as string[],
  });

  return NextResponse.json({ response });
}
