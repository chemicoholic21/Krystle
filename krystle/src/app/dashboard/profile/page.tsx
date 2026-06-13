"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Save, Sparkles, Loader2 } from "lucide-react";
import { GithubIcon as Github } from "@/components/icons";

interface Profile {
  githubUrl: string | null;
  linkedinUrl: string | null;
  experienceLevel: string;
  preferredLocations: string[];
  remotePreference: string;
  desiredRoles: string[];
  skills: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      console.error("Failed to fetch profile", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
    } catch (e) {
      console.error("Failed to save", e);
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyzeGithub = async () => {
    if (!profile?.githubUrl) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: profile.githubUrl }),
      });
      const data = await res.json();
      if (data.analysis?.skills) {
        setProfile((prev) =>
          prev ? { ...prev, skills: data.analysis.skills } : null
        );
      }
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.analysis?.skills) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                skills: [...new Set([...prev.skills, ...data.analysis.skills])],
              }
            : null
        );
      }
    } catch (e) {
      console.error("Resume upload failed", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your preferences and skills</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="preferences">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={profile.experienceLevel}
                  onValueChange={(v) =>
                    setProfile((prev) =>
                      prev ? { ...prev, experienceLevel: v || "STUDENT" } : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["STUDENT", "INTERN", "NEW_GRAD", "JUNIOR", "MID_LEVEL", "SENIOR"].map(
                      (level) => (
                        <SelectItem key={level} value={level}>
                          {level.replace("_", " ")}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Remote Preference</Label>
                <Select
                  value={profile.remotePreference}
                  onValueChange={(v) =>
                    setProfile((prev) =>
                      prev ? { ...prev, remotePreference: v || "REMOTE" } : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["REMOTE", "HYBRID", "ONSITE", "ANY"].map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Locations</Label>
                <div className="flex flex-wrap gap-1">
                  {profile.preferredLocations.map((loc) => (
                    <Badge key={loc} variant="secondary">
                      {loc}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Desired Roles</Label>
                <div className="flex flex-wrap gap-1">
                  {profile.desiredRoles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="default">
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No skills detected yet. Analyze your GitHub or upload a resume.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>GitHub</Label>
                <div className="flex gap-2">
                  <Input
                    value={profile.githubUrl || ""}
                    onChange={(e) =>
                      setProfile((prev) =>
                        prev ? { ...prev, githubUrl: e.target.value } : null
                      )
                    }
                    placeholder="https://github.com/username"
                  />
                  <Button
                    variant="outline"
                    onClick={handleAnalyzeGithub}
                    disabled={!profile.githubUrl || analyzing}
                  >
                    {analyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resume</Label>
                <Input type="file" accept=".pdf" onChange={handleResumeUpload} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
