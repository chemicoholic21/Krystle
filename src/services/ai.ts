import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return openai;
}

export async function analyzeJobMatch(
  profile: {
    skills: string[];
    experienceLevel: string;
    desiredRoles: string[];
    preferredLocations: string[];
    remotePreference: string;
  },
  job: {
    title: string;
    company: string;
    description: string;
    location: string;
    remote: string;
    tags: string[];
  }
): Promise<{ score: number; reasons: string[] }> {
  const prompt = `You are a job matching AI. Score this job for the candidate (0-100).

CANDIDATE:
- Skills: ${profile.skills.join(", ")}
- Level: ${profile.experienceLevel}
- Desired roles: ${profile.desiredRoles.join(", ")}
- Preferred locations: ${profile.preferredLocations.join(", ")}
- Remote preference: ${profile.remotePreference}

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description?.substring(0, 1000)}
- Location: ${job.location}
- Remote: ${job.remote}
- Tags: ${job.tags.join(", ")}

Scoring rules:
- +40 for skills overlap
- +20 for role relevance
- +15 for location match
- +15 for remote match
- -50 if senior/lead/staff/principal/architect/manager role for student/new grad
- -30 for missing required skills
- -20 for experience mismatch

Return JSON: {"score": number, "reasons": ["reason1", "reason2"]}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "google/gemini-2.5-flash-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { score: 0, reasons: ["Analysis failed"] };

    const result = JSON.parse(content);
    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      reasons: result.reasons || [],
    };
  } catch {
    return { score: 0, reasons: ["Analysis error"] };
  }
}

export async function analyzeGitHubProfile(
  repos: Array<{
    name: string;
    language: string | null;
    topics: string[];
    stargazers_count: number;
    description: string | null;
  }>
) {
  const prompt = `Analyze this GitHub profile and extract skills, seniority, and domains.

Repositories (${repos.length} total):
${repos
  .slice(0, 30)
  .map(
    (r) =>
      `- ${r.name}: ${r.language || "N/A"} | Stars: ${r.stargazers_count} | Topics: ${r.topics.join(", ")} | ${r.description || ""}`
  )
  .join("\n")}

Return JSON: {
  "languages": ["lang1", "lang2"],
  "skills": ["skill1", "skill2"],
  "technologies": ["tech1", "tech2"],
  "seniority": "student|junior|mid|senior",
  "domains": ["web", "ml", "devops", etc]
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "google/gemini-2.5-flash-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function analyzeResume(resumeText: string) {
  const prompt = `Extract structured data from this resume text:

${resumeText.substring(0, 4000)}

Return JSON: {
  "skills": ["skill1", "skill2"],
  "experience": ["exp1", "exp2"],
  "education": ["edu1"],
  "projects": ["project1"],
  "achievements": ["achievement1"]
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "google/gemini-2.5-flash-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function careerCoach(
  question: string,
  profile: { skills: string[]; experienceLevel: string; desiredRoles: string[] },
  jobMarketContext?: string
) {
  const prompt = `You are an AI career coach for tech workers. Answer this question concisely.

Candidate profile:
- Skills: ${profile.skills.join(", ")}
- Level: ${profile.experienceLevel}
- Target roles: ${profile.desiredRoles.join(", ")}

${jobMarketContext ? `Market context: ${jobMarketContext}` : ""}

Question: ${question}

Provide actionable, specific advice in 2-3 paragraphs.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "google/gemini-2.5-flash-preview",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content || "I couldn't generate advice at this time.";
  } catch {
    return "I'm having trouble connecting right now. Please try again later.";
  }
}

export async function tailorResume(
  resumeText: string,
  jobDescription: string
) {
  const prompt = `Tailor this resume for the job. Highlight relevant skills, optimize keywords for ATS.

RESUME:
${resumeText.substring(0, 3000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

Return JSON: {
  "tailored_sections": {
    "summary": "tailored summary",
    "skills_to_highlight": ["skill1", "skill2"],
    "keywords_to_add": ["keyword1", "keyword2"],
    "experience_bullets": ["bullet1", "bullet2"],
    "suggestions": ["suggestion1", "suggestion2"]
  }
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "google/gemini-2.5-flash-preview",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch {
    return null;
  }
}
