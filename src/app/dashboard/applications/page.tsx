"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, MapPin, ExternalLink, Clock } from "lucide-react";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  notes: string | null;
  job: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    url: string | null;
    matchScore: number | null;
  };
}

const STATUS_COLUMNS = [
  { key: "APPLIED", label: "Applied", color: "bg-blue-500" },
  { key: "INTERVIEW", label: "Interview", color: "bg-yellow-500" },
  { key: "ASSESSMENT", label: "Assessment", color: "bg-purple-500" },
  { key: "OFFER", label: "Offer", color: "bg-green-500" },
  { key: "REJECTED", label: "Rejected", color: "bg-red-500" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/jobs?status=APPLIED");
      const data = await res.json();
      setApplications(data.jobs || []);
    } catch (e) {
      console.error("Failed to fetch applications", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchApplications();
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-muted-foreground">Track your job applications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const columnApps = applications.filter(
            (a) => a.status === col.key
          );

          return (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="font-medium text-sm">{col.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnApps.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {columnApps.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-6 text-center">
                      <p className="text-xs text-muted-foreground">None</p>
                    </CardContent>
                  </Card>
                ) : (
                  columnApps.map((app) => (
                    <Card key={app.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                      <CardContent className="p-3 space-y-2">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {app.job.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building className="w-3 h-3" />
                          {app.job.company}
                        </div>
                        {app.job.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {app.job.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                        {app.job.url && (
                          <a href={app.job.url} target="_blank" rel="noopener noreferrer" className="w-full">
                            <Button size="sm" variant="ghost" className="w-full text-xs h-7">
                              <ExternalLink className="w-3 h-3 mr-1" /> View
                            </Button>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
