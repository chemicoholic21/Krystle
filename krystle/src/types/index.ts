export type ExperienceLevel =
  | "STUDENT"
  | "INTERN"
  | "NEW_GRAD"
  | "JUNIOR"
  | "MID_LEVEL"
  | "SENIOR";

export type RemotePreference = "REMOTE" | "HYBRID" | "ONSITE" | "ANY";

export type JobCategory = "RECOMMENDED" | "REVIEW" | "IGNORE";

export type ApplicationStatus =
  | "APPLIED"
  | "INTERVIEW"
  | "ASSESSMENT"
  | "REJECTED"
  | "OFFER";

export type FeedbackAction = "APPLY" | "WATCHLIST" | "IGNORE";

export interface ProfileData {
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  experienceLevel?: ExperienceLevel;
  preferredLocations?: string[];
  remotePreference?: RemotePreference;
  desiredRoles?: string[];
  skills?: string[];
}

export interface JobMatchResult {
  score: number;
  category: JobCategory;
  reasons: string[];
}

export interface GitHubAnalysis {
  repos: number;
  languages: string[];
  topTechnologies: string[];
  commitActivity: string;
  skills: string[];
  seniority: string;
  domains: string[];
}

export interface ResumeAnalysis {
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  achievements: string[];
}
