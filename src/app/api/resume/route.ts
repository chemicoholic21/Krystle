import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processResume } from "@/services/resume";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("resume") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { text, analysis } = await processResume(buffer);

    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        resumeAnalysis: analysis,
        skills: analysis?.skills || [],
      },
      create: {
        userId: session.user.id,
        resumeAnalysis: analysis,
        skills: analysis?.skills || [],
      },
    });

    return NextResponse.json({ text, analysis });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}
