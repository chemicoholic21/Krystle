export interface JobListing {
  title: string;
  company: string;
  location: string;
  remote: string;
  salary: string;
  description: string;
  url: string;
  source: string;
  sourceId: string;
  tags: string[];
}

export async function fetchGreenhouseJobs(boardToken: string): Promise<JobListing[]> {
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`
    );
    const data = await res.json();

    return (data.jobs || []).map((job: Record<string, unknown>) => ({
      title: job.title as string,
      company: boardToken,
      location: (job.location as Record<string, unknown>)?.name as string || "Unknown",
      remote: "ONSITE",
      salary: "",
      description: (job.content as string) || "",
      url: (job.absolute_url as string) || "",
      source: "greenhouse",
      sourceId: job.id?.toString() || "",
      tags: ((job.departments as Array<Record<string, unknown>>) || []).map(
        (d) => d.name as string
      ),
    }));
  } catch {
    return [];
  }
}

export async function fetchLeverJobs(companySlug: string): Promise<JobListing[]> {
  try {
    const res = await fetch(
      `https://api.lever.co/v0/postings/${companySlug}?mode=json`
    );
    const data = await res.json();

    return (data || []).map((job: Record<string, unknown>) => ({
      title: job.text as string,
      company: companySlug,
      location: (job.categories as Record<string, unknown>)?.location as string || "Unknown",
      remote: ((job.categories as Record<string, unknown>)?.Commitment as string)?.toLowerCase().includes("remote")
        ? "REMOTE"
        : "ONSITE",
      salary: (job.categories as Record<string, unknown>)?.salary as string || "",
      description: (job.descriptionPlain as string) || "",
      url: (job.hostedUrl as string) || "",
      source: "lever",
      sourceId: job.id as string || "",
      tags: [
        (job.categories as Record<string, unknown>)?.team as string,
        (job.categories as Record<string, unknown>)?.Commitment as string,
      ].filter(Boolean) as string[],
    }));
  } catch {
    return [];
  }
}

export async function fetchRemoteOKJobs(): Promise<JobListing[]> {
  try {
    const res = await fetch("https://remoteok.com/api");
    const data = await res.json();

    return (data || [])
      .filter((job: Record<string, unknown>) => job.position)
      .map((job: Record<string, unknown>) => ({
        title: job.position as string,
        company: (job.company as string) || "Unknown",
        location: (job.location as string) || "Remote",
        remote: "REMOTE",
        salary: (job.salary as string) || "",
        description: (job.description as string) || "",
        url: (job.url as string) || "",
        source: "remoteok",
        sourceId: job.id?.toString() || "",
        tags: (job.tags as string[]) || [],
      }));
  } catch {
    return [];
  }
}

export async function fetchYCJobs(): Promise<JobListing[]> {
  try {
    const res = await fetch("https://www.workatastartup.com/jobs/api");
    const data = await res.json();

    return (data || [])
      .filter((job: Record<string, unknown>) => job.title)
      .map((job: Record<string, unknown>) => ({
        title: job.title as string,
        company: (job.company_name as string) || "YC Startup",
        location: (job.location as string) || "Unknown",
        remote: (job.remote as boolean) ? "REMOTE" : "ONSITE",
        salary: job.salary_range as string || "",
        description: (job.description as string) || "",
        url: `https://www.workatastartup.com/jobs/${job.id}`,
        source: "yc",
        sourceId: job.id?.toString() || "",
        tags: (job.roles as string[]) || [],
      }));
  } catch {
    return [];
  }
}

export async function fetchAllJobs(): Promise<JobListing[]> {
  const [remoteOK, yc] = await Promise.allSettled([
    fetchRemoteOKJobs(),
    fetchYCJobs(),
  ]);

  const jobs: JobListing[] = [];

  if (remoteOK.status === "fulfilled") jobs.push(...remoteOK.value);
  if (yc.status === "fulfilled") jobs.push(...yc.value);

  return jobs;
}
