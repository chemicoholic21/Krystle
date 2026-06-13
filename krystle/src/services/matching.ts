import { ExperienceLevel, JobCategory } from "@/types";

interface MatchInput {
  skills: string[];
  experienceLevel: ExperienceLevel;
  desiredRoles: string[];
  preferredLocations: string[];
  remotePreference: string;
}

interface JobInput {
  title: string;
  location: string;
  remote: string;
  tags: string[];
  description: string;
}

const SENIOR_KEYWORDS = [
  "senior",
  "lead",
  "staff",
  "principal",
  "architect",
  "manager",
  "director",
  "vp",
  "head",
];

const MANAGER_KEYWORDS = ["manager", "director", "vp", "head", "lead"];

export function computeMatchScore(profile: MatchInput, job: JobInput): {
  score: number;
  category: JobCategory;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  // Skills overlap (+40 max)
  const jobText = `${job.title} ${job.description} ${job.tags.join(" ")}`.toLowerCase();
  const matchingSkills = profile.skills.filter((skill) =>
    jobText.includes(skill.toLowerCase())
  );
  const skillsScore = Math.min(40, (matchingSkills.length / Math.max(profile.skills.length, 1)) * 40);
  score += skillsScore;
  if (matchingSkills.length > 0) {
    reasons.push(`Skills match: ${matchingSkills.join(", ")}`);
  }

  // Role relevance (+20)
  const titleLower = job.title.toLowerCase();
  const roleMatch = profile.desiredRoles.some(
    (role) =>
      titleLower.includes(role.toLowerCase()) ||
      role.toLowerCase().includes(titleLower)
  );
  if (roleMatch) {
    score += 20;
    reasons.push("Role matches desired positions");
  }

  // Location match (+15)
  const locationMatch =
    profile.preferredLocations.some(
      (loc) =>
        job.location.toLowerCase().includes(loc.toLowerCase()) ||
        loc.toLowerCase().includes(job.location.toLowerCase())
    ) || profile.preferredLocations.length === 0;
  if (locationMatch) {
    score += 15;
    reasons.push("Location matches preference");
  }

  // Remote match (+15)
  const remoteMatch =
    profile.remotePreference === "ANY" ||
    profile.remotePreference === job.remote ||
    (profile.remotePreference === "REMOTE" && job.remote === "REMOTE");
  if (remoteMatch) {
    score += 15;
    reasons.push("Remote preference matches");
  }

  // Negative: Senior role for junior candidate
  const isSeniorRole = SENIOR_KEYWORDS.some((kw) => titleLower.includes(kw));
  const isJuniorLevel = ["STUDENT", "INTERN", "NEW_GRAD", "JUNIOR"].includes(
    profile.experienceLevel
  );
  if (isSeniorRole && isJuniorLevel) {
    score -= 50;
    reasons.push("Senior role not suitable for experience level");
  }

  // Negative: Manager role
  const isManagerRole = MANAGER_KEYWORDS.some((kw) => titleLower.includes(kw));
  if (isManagerRole && isJuniorLevel) {
    score -= 50;
    reasons.push("Management role not suitable for experience level");
  }

  // Normalize score
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine category
  let category: JobCategory;
  if (score >= 80) {
    category = "RECOMMENDED";
  } else if (score >= 60) {
    category = "REVIEW";
  } else {
    category = "IGNORE";
  }

  return { score, category, reasons };
}

export function hardFilter(profile: MatchInput, job: JobInput): boolean {
  const titleLower = job.title.toLowerCase();

  if (profile.experienceLevel === "STUDENT") {
    const rejectKeywords = ["senior", "lead", "staff", "principal", "architect", "manager"];
    if (rejectKeywords.some((kw) => titleLower.includes(kw))) {
      return false;
    }
  }

  if (profile.experienceLevel === "NEW_GRAD") {
    const yearMatch = job.description.match(/(\d+)\+?\s*years?\s*(of\s*)?experience/i);
    if (yearMatch && parseInt(yearMatch[1]) > 3) {
      return false;
    }
  }

  return true;
}
