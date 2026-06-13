import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMatchScore, hardFilter } from "@/services/matching";
import { ExperienceLevel } from "@/types";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const remote = searchParams.get("remote");
  const location = searchParams.get("location");
  const role = searchParams.get("role");
  const cursor = searchParams.get("cursor");
  const limit = 20;

  const where: Record<string, unknown> = { userId: session.user.id };
  if (category) where.category = category;
  if (remote) where.remote = remote;
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (role) where.title = { contains: role, mode: "insensitive" };

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { matchScore: "desc" },
    take: limit,
    skip: cursor ? 1 : 0,
    ...(cursor ? { cursor: { id: cursor } } : {}),
  });

  const nextCursor = jobs.length === limit ? jobs[jobs.length - 1].id : null;

  return NextResponse.json({ jobs, nextCursor });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }

  const matchInput = {
    skills: profile.skills as string[],
    experienceLevel: (profile.experienceLevel || "STUDENT") as ExperienceLevel,
    desiredRoles: profile.desiredRoles as string[],
    preferredLocations: profile.preferredLocations as string[],
    remotePreference: profile.remotePreference || "REMOTE",
  };

  const jobInput = {
    title: data.title,
    location: data.location || "",
    remote: data.remote || "ONSITE",
    tags: data.tags || [],
    description: data.description || "",
  };

  if (!hardFilter(matchInput, jobInput)) {
    return NextResponse.json({ error: "Job filtered out" }, { status: 400 });
  }

  const { score, category, reasons } = computeMatchScore(matchInput, jobInput);

  const job = await prisma.job.create({
    data: {
      title: data.title,
      company: data.company,
      location: data.location,
      remote: data.remote,
      salary: data.salary,
      description: data.description,
      url: data.url,
      source: data.source,
      sourceId: data.sourceId,
      matchScore: score,
      category,
      tags: data.tags || [],
      userId: session.user.id,
    },
  });

  return NextResponse.json({ job, reasons });
}
