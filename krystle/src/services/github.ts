import { Octokit } from "@octokit/rest";
import { analyzeGitHubProfile } from "@/services/ai";

export async function fetchGitHubProfile(githubUrl: string) {
  const match = githubUrl.match(/github\.com\/([^\/]+)/);
  if (!match) throw new Error("Invalid GitHub URL");

  const username = match[1];
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const { data: user } = await octokit.rest.users.getByUsername({
    username,
  });

  const { data: repos } = await octokit.rest.repos.listForUser({
    username,
    sort: "updated",
    per_page: 100,
  });

  const analysis = await analyzeGitHubProfile(
    repos.map((r) => ({
      name: r.name,
      language: r.language ?? null,
      topics: r.topics || [],
      stargazers_count: r.stargazers_count || 0,
      description: r.description ?? null,
    }))
  );

  return {
    user: {
      login: user.login,
      name: user.name,
      bio: user.bio,
      public_repos: user.public_repos,
      followers: user.followers,
      following: user.following,
    },
    repos: repos.map((r) => ({
      name: r.name,
      language: r.language,
      topics: r.topics || [],
      stargazers_count: r.stargazers_count || 0,
      description: r.description,
      updated_at: r.updated_at,
    })),
    analysis,
  };
}
