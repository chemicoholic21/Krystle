"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Building, ExternalLink, Bookmark, Check, X, Loader2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote: string | null;
  salary: string | null;
  description: string | null;
  url: string | null;
  matchScore: number | null;
  category: string | null;
  tags: string[];
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [remote, setRemote] = useState("all");
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchJobs = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (remote !== "all") params.set("remote", remote);
      if (search) params.set("role", search);
      if (cursor && !reset) params.set("cursor", cursor);

      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();

      if (reset) {
        setJobs(data.jobs || []);
      } else {
        setJobs((prev) => [...prev, ...(data.jobs || [])]);
      }
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (e) {
      console.error("Failed to fetch jobs", e);
    } finally {
      setLoading(false);
    }
  }, [category, remote, search, cursor]);

  useEffect(() => {
    setCursor(null);
    fetchJobs(true);
  }, [category, remote, search]);

  const handleFeedback = async (jobId: string, action: string) => {
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, action }),
      });

      if (action === "IGNORE") {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    } catch (e) {
      console.error("Feedback failed", e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job Feed</h1>
        <p className="text-muted-foreground">
          AI-curated opportunities matched to your profile
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-64"
        />
        <Select value={remote} onValueChange={(v) => setRemote(v || "all")}>
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Remote" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="REMOTE">Remote</SelectItem>
            <SelectItem value="HYBRID">Hybrid</SelectItem>
            <SelectItem value="ONSITE">On-site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="RECOMMENDED">Recommended</TabsTrigger>
          <TabsTrigger value="REVIEW">Review</TabsTrigger>
        </TabsList>

        <TabsContent value={category} className="mt-4">
          {jobs.length === 0 && !loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No jobs found. Jobs will appear here once discovered by Krystle.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{job.title}</h3>
                          <Badge
                            variant={
                              job.category === "RECOMMENDED"
                                ? "default"
                                : job.category === "REVIEW"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="shrink-0"
                          >
                            {job.matchScore}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {job.company}
                          </span>
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                          )}
                          {job.remote && (
                            <Badge variant="outline" className="text-xs">
                              {job.remote}
                            </Badge>
                          )}
                        </div>
                        {job.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {job.description.substring(0, 200)}
                          </p>
                        )}
                        {job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.tags.slice(0, 5).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleFeedback(job.id, "APPLY")}
                          className="w-24"
                        >
                          <Check className="w-3 h-3 mr-1" /> Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeedback(job.id, "WATCHLIST")}
                          className="w-24"
                        >
                          <Bookmark className="w-3 h-3 mr-1" /> Watch
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFeedback(job.id, "IGNORE")}
                          className="w-24 text-muted-foreground"
                        >
                          <X className="w-3 h-3 mr-1" /> Ignore
                        </Button>
                        {job.url && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer" className="w-24">
                            <Button size="sm" variant="ghost" className="w-full">
                              <ExternalLink className="w-3 h-3 mr-1" /> View
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchJobs(false)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
