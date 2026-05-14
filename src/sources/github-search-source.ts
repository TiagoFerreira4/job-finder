import { env } from "../config/env.js";
import { normalizeText } from "../filters/text.js";
import type { JobSource, SourceJob } from "../types/index.js";

const GITHUB_SEARCH_URL = "https://api.github.com/search/issues";
const DESCRIPTION_MAX_LENGTH = 1000;

const SEARCH_QUERIES = [
  "repo:frontendbr/vagas is:issue state:open estágio remoto",
  "repo:frontendbr/vagas is:issue state:open estágio recife",
  "repo:frontendbr/vagas is:issue state:open label:Júnior label:Remoto",
  "repo:backend-br/vagas is:issue state:open estágio remoto",
  "repo:backend-br/vagas is:issue state:open estágio recife",
  "repo:backend-br/vagas is:issue state:open label:Júnior label:Remoto",
];

type GitHubIssueLabel = {
  name: string;
};

type GitHubSearchIssue = {
  title: string;
  html_url: string;
  body?: string | null;
  labels?: GitHubIssueLabel[];
  repository_url: string;
};

type GitHubSearchResponse = {
  items?: GitHubSearchIssue[];
};

function buildSearchUrl(query: string): string {
  const url = new URL(GITHUB_SEARCH_URL);

  url.searchParams.set("q", query);
  url.searchParams.set("sort", "updated");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", "10");

  return url.toString();
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "job-finder",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (env.githubToken) {
    headers.Authorization = `Bearer ${env.githubToken}`;
  }

  return headers;
}

function getRepositoryName(repositoryUrl: string): string {
  return repositoryUrl.split("/").slice(-2).join("/");
}

function extractCompany(title: string): string | undefined {
  const patterns = [
    /\bna\s+(.+?)(?:\s+-|\s+\(|$)/i,
    /\bno\s+(.+?)(?:\s+-|\s+\(|$)/i,
    /@\s*(.+?)(?:\s+-|\s+\(|$)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    const company = match?.[1]?.trim();

    if (company) {
      return company;
    }
  }

  return undefined;
}

function inferLocation(title: string, body?: string | null): string | undefined {
  const text = normalizeText(`${title} ${body ?? ""}`);
  const locations: string[] = [];

  if (text.includes("recife")) {
    locations.push("Recife");
  }

  if (text.includes("remoto")) {
    locations.push("Remoto");
  }

  if (text.includes("hibrido")) {
    locations.push("Hibrido");
  }

  if (text.includes("presencial")) {
    locations.push("Presencial");
  }

  return locations.length > 0 ? locations.join(" / ") : undefined;
}

function buildDescription(issue: GitHubSearchIssue): string | undefined {
  const labels =
    issue.labels && issue.labels.length > 0
      ? `Labels: ${issue.labels.map((label) => label.name).join(", ")}\n\n`
      : "";
  const body = issue.body ?? "";
  const description = `${labels}${body}`.trim();

  return description ? description.slice(0, DESCRIPTION_MAX_LENGTH) : undefined;
}

function mapIssueToSourceJob(issue: GitHubSearchIssue): SourceJob {
  return {
    title: issue.title,
    company: extractCompany(issue.title),
    location: inferLocation(issue.title, issue.body),
    url: issue.html_url,
    source: "GitHub Search",
    description: buildDescription(issue),
    rawPayload: {
      repository: getRepositoryName(issue.repository_url),
      issue,
    },
  };
}

async function fetchIssues(query: string): Promise<GitHubSearchIssue[]> {
  const response = await fetch(buildSearchUrl(query), {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `GitHub Search falhou para "${query}" (${response.status}): ${body}`,
    );
  }

  const payload = (await response.json()) as GitHubSearchResponse;

  return payload.items ?? [];
}

export const githubSearchSource: JobSource = {
  name: "GitHub Search",
  async fetchJobs() {
    const jobsByUrl = new Map<string, SourceJob>();
    const errors: string[] = [];

    for (const query of SEARCH_QUERIES) {
      let issues: GitHubSearchIssue[];

      try {
        issues = await fetchIssues(query);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
        break;
      }

      for (const issue of issues) {
        if (!jobsByUrl.has(issue.html_url)) {
          jobsByUrl.set(issue.html_url, mapIssueToSourceJob(issue));
        }
      }
    }

    if (jobsByUrl.size === 0 && errors.length > 0) {
      throw new Error(errors.join(" | "));
    }

    if (errors.length > 0) {
      console.log(
        `[SOURCE] GitHub Search retornou resultado parcial: ${errors[0]}`,
      );
    }

    return [...jobsByUrl.values()];
  },
};
