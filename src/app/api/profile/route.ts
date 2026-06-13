import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl,
      experienceLevel: data.experienceLevel,
      preferredLocations: data.preferredLocations || [],
      remotePreference: data.remotePreference || "REMOTE",
      desiredRoles: data.desiredRoles || [],
      skills: data.skills || [],
    },
    create: {
      userId: session.user.id,
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl,
      experienceLevel: data.experienceLevel,
      preferredLocations: data.preferredLocations || [],
      remotePreference: data.remotePreference || "REMOTE",
      desiredRoles: data.desiredRoles || [],
      skills: data.skills || [],
    },
  });

  return NextResponse.json(profile);
}
