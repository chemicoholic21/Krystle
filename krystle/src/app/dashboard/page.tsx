import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, Bookmark, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  const [totalJobs, applications, watchlisted, recommended] = await Promise.all([
    prisma.job.count({ where: { userId: session!.user!.id } }),
    prisma.application.count({ where: { userId: session!.user!.id } }),
    prisma.job.count({ where: { userId: session!.user!.id, status: "WATCHLISTED" } }),
    prisma.job.count({ where: { userId: session!.user!.id, category: "RECOMMENDED" } }),
  ]);

  const recentJobs = await prisma.job.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { title: "Jobs Found", value: totalJobs, icon: Briefcase, color: "text-blue-500" },
    { title: "Applications", value: applications, icon: FileText, color: "text-green-500" },
    { title: "Watchlisted", value: watchlisted, icon: Bookmark, color: "text-yellow-500" },
    { title: "Recommended", value: recommended, icon: TrendingUp, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your job search at a glance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No jobs found yet. Jobs will appear here once discovered.
            </p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.company} &middot; {job.location || "Remote"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        job.category === "RECOMMENDED"
                          ? "bg-green-500/10 text-green-500"
                          : job.category === "REVIEW"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {job.matchScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
