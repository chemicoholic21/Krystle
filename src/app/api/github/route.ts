import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchGitHubProfile } from "@/services/github";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { githubUrl } = await req.json();

  try {
    const result = await fetchGitHubProfile(githubUrl);

    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        githubUrl,
        githubAnalysis: result.analysis,
        skills: result.analysis?.skills || [],
      },
      create: {
        userId: session.user.id,
        githubUrl,
        githubAnalysis: result.analysis,
        skills: result.analysis?.skills || [],
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze GitHub profile" },
      { status: 500 }
    );
  }
}
