import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId, action } = await req.json();

  await prisma.feedback.create({
    data: {
      userId: session.user.id,
      jobId,
      action,
    },
  });

  if (action === "APPLY") {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "APPLIED" },
    });

    await prisma.application.upsert({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId,
        },
      },
      update: { status: "APPLIED" },
      create: {
        userId: session.user.id,
        jobId,
        status: "APPLIED",
      },
    });
  } else if (action === "WATCHLIST") {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "WATCHLISTED" },
    });
  } else if (action === "IGNORE") {
    await prisma.job.update({
      where: { id: jobId },
      data: { category: "IGNORE" },
    });
  }

  return NextResponse.json({ success: true });
}
