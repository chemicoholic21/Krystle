"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { GithubIcon as Github } from "@/components/icons";

const EXPERIENCE_LEVELS = [
  { value: "STUDENT", label: "Student" },
  { value: "INTERN", label: "Intern" },
  { value: "NEW_GRAD", label: "New Grad" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID_LEVEL", label: "Mid-Level" },
  { value: "SENIOR", label: "Senior" },
];

const REMOTE_OPTIONS = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
  { value: "ANY", label: "Any" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    githubUrl: "",
    linkedinUrl: "",
    experienceLevel: "STUDENT",
    preferredLocations: [] as string[],
    remotePreference: "REMOTE",
    desiredRoles: [] as string[],
    skills: [] as string[],
  });
  const [locationInput, setLocationInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyzeGithub = async () => {
    if (!form.githubUrl) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: form.githubUrl }),
      });
      const data = await res.json();
      if (data.analysis?.skills) {
        setForm((prev) => ({ ...prev, skills: data.analysis.skills }));
      }
    } catch (e) {
      console.error("GitHub analysis failed", e);
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
        setForm((prev) => ({
          ...prev,
          skills: [...new Set([...prev.skills, ...data.analysis.skills])],
        }));
      }
    } catch (e) {
      console.error("Resume upload failed", e);
    }
  };

  const addTag = (
    field: "preferredLocations" | "desiredRoles" | "skills",
    value: string,
    setter: (v: string) => void
  ) => {
    if (value.trim() && !form[field].includes(value.trim())) {
      setForm((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setter("");
    }
  };

  const removeTag = (field: "preferredLocations" | "desiredRoles" | "skills", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((v) => v !== value),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      router.push("/dashboard");
    } catch (e) {
      console.error("Failed to save profile", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">K</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Krystle</CardTitle>
          <p className="text-muted-foreground">
            Let&apos;s set up your profile to find the best jobs for you
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Info</h3>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="github"
                      placeholder="https://github.com/username"
                      className="pl-9"
                      value={form.githubUrl}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, githubUrl: e.target.value }))
                      }
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleAnalyzeGithub}
                    disabled={!form.githubUrl || analyzing}
                  >
                    {analyzing ? (
                      "Analyzing..."
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-1" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL (optional)</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={form.linkedinUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Resume (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full">
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Preferences</h3>

              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={form.experienceLevel}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, experienceLevel: v || "STUDENT" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Remote Preference</Label>
                <Select
                  value={form.remotePreference}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, remotePreference: v || "REMOTE" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMOTE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Locations</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. San Francisco"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("preferredLocations", locationInput, setLocationInput);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      addTag("preferredLocations", locationInput, setLocationInput)
                    }
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.preferredLocations.map((loc) => (
                    <Badge
                      key={loc}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag("preferredLocations", loc)}
                    >
                      {loc} &times;
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Skills & Roles</h3>

              <div className="space-y-2">
                <Label>Desired Roles</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Frontend Engineer"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("desiredRoles", roleInput, setRoleInput);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => addTag("desiredRoles", roleInput, setRoleInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.desiredRoles.map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag("desiredRoles", role)}
                    >
                      {role} &times;
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. React, Python"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("skills", skillInput, setSkillInput);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => addTag("skills", skillInput, setSkillInput)}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Auto-detected from GitHub and resume analysis above
                </p>
                <div className="flex flex-wrap gap-1">
                  {form.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag("skills", skill)}
                    >
                      {skill} &times;
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? "Saving..." : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full ${
                  s === step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
