import { env } from "../config/env.js";
import { normalizeText } from "../filters/text.js";
import { inferWorkMode } from "../filters/work-mode.js";
import type { JobSource, SourceJob } from "../types/index.js";
import { githubIssuesRepositories } from "./sources-config.js";
import type { GitHubIssuesRepositoryConfig } from "./sources-config.js";

const GITHUB_API_URL = "https://api.github.com";
const DESCRIPTION_MAX_LENGTH = 1000;
const PER_PAGE = 100;

type GitHubIssueLabel = {
  name: string;
};

type GitHubIssue = {
  title: string;
  html_url: string;
  body?: string | null;
  labels?: GitHubIssueLabel[];
  pull_request?: unknown;
};

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

function buildIssuesUrl(repository: GitHubIssuesRepositoryConfig): string {
  const url = new URL(
    `/repos/${repository.owner}/${repository.repo}/issues`,
    GITHUB_API_URL,
  );

  url.searchParams.set("state", "open");
  url.searchParams.set("sort", "updated");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", String(PER_PAGE));

  return url.toString();
}

function getRepositorySlug(repository: GitHubIssuesRepositoryConfig): string {
  return `${repository.owner}/${repository.repo}`;
}

function getLabelsText(issue: GitHubIssue): string {
  return issue.labels?.map((label) => label.name).join(" ") ?? "";
}

function getIssueText(issue: GitHubIssue): string {
  return normalizeText(
    [issue.title, issue.body, getLabelsText(issue)].filter(Boolean).join(" "),
  );
}

function cleanPhysicalLocation(value: string): string | undefined {
  const cleaned = normalizeText(value)
    .replace(/\b(100%|full|fully|totalmente)\b/g, " ")
    .replace(/\b(remoto|remote|hibrido|hybrid|presencial|onsite|on-site)\b/g, " ")
    .replace(/\b(vaga|job|jr|junior|pleno|senior|developer|desenvolvedor)\b/g, " ")
    .replace(/[|()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned === "brasil") {
    return undefined;
  }

  const location = cleaned
    .split(/[-/,]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) =>
      part
        .split(" ")
        .map((word) => {
          if (["df", "pe", "sp", "rj", "mg", "pr", "sc", "rs"].includes(word)) {
            return word.toUpperCase();
          }

          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" "),
    )
    .join(" / ");

  return location || undefined;
}

function hasAnyTerm(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function isTargetOpportunity(issue: GitHubIssue): boolean {
  const text = getIssueText(issue);

  return hasAnyTerm(text, [
    "estagio",
    "trainee",
    "junior",
    " jr",
    "entry level",
    "entry-level",
  ]);
}

function extractCompany(title: string): string | undefined {
  const patterns = [
    /\bna\s+(.+?)(?:\s+-|\s+\(|$)/i,
    /\bno\s+(.+?)(?:\s+-|\s+\(|$)/i,
    /@\s*(.+?)(?:\s+-|\s+\(|$)/i,
    /-\s*([^-()[\]]+?)$/i,
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

function inferPhysicalLocation(issue: GitHubIssue): string | undefined {
  const text = getIssueText(issue);

  if (text.includes("recife") || text.includes("pernambuco")) {
    return "Recife/PE";
  }

  const bracketMatch = issue.title.match(/\[([^\]]+)\]/);
  const bracketLocation = bracketMatch?.[1]
    ? cleanPhysicalLocation(bracketMatch[1])
    : undefined;

  if (bracketLocation) {
    return bracketLocation;
  }

  return undefined;
}

function buildDescription(issue: GitHubIssue): string | undefined {
  const labels =
    issue.labels && issue.labels.length > 0
      ? `Labels: ${issue.labels.map((label) => label.name).join(", ")}\n\n`
      : "";
  const body = issue.body ?? "";
  const description = `${labels}${body}`.trim();

  return description ? description.slice(0, DESCRIPTION_MAX_LENGTH) : undefined;
}

function mapIssueToSourceJob(
  issue: GitHubIssue,
  repository: GitHubIssuesRepositoryConfig,
): SourceJob {
  return {
    title: issue.title,
    company: extractCompany(issue.title),
    location: inferPhysicalLocation(issue),
    workMode: inferWorkMode({
      title: issue.title,
      source: repository.sourceName,
      description: buildDescription(issue),
    }),
    url: issue.html_url,
    source: repository.sourceName,
    description: buildDescription(issue),
    rawPayload: {
      repository: getRepositorySlug(repository),
      category: repository.category,
      priority: repository.priority,
      issue,
    },
  };
}

async function fetchRepositoryIssues(
  repository: GitHubIssuesRepositoryConfig,
): Promise<GitHubIssue[]> {
  const response = await fetch(buildIssuesUrl(repository), {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `${getRepositorySlug(repository)} (${response.status}): ${body}`,
    );
  }

  const issues = (await response.json()) as GitHubIssue[];

  return issues.filter((issue) => !issue.pull_request);
}

export async function fetchJobsFromGitHubIssuesRepositories(
  configuredRepositories: GitHubIssuesRepositoryConfig[] = githubIssuesRepositories,
): Promise<SourceJob[]> {
  const jobsByUrl = new Map<string, SourceJob>();
  const repositories = configuredRepositories
    .filter((repository) => repository.enabled)
    .sort((a, b) => a.priority - b.priority);
  let successfulRepositories = 0;

  for (const repository of repositories) {
    try {
      const issues = await fetchRepositoryIssues(repository);
      const candidates = issues.filter(isTargetOpportunity);
      successfulRepositories += 1;

      for (const issue of candidates) {
        if (!jobsByUrl.has(issue.html_url)) {
          jobsByUrl.set(issue.html_url, mapIssueToSourceJob(issue, repository));
        }
      }

      console.log(
        `[SOURCE] ${getRepositorySlug(repository)}: ${issues.length} issues abertas, ${candidates.length} candidatas`,
      );
    } catch (error) {
      console.log(
        `[SOURCE] ${getRepositorySlug(repository)}: falhou (${
          error instanceof Error ? error.message : String(error)
        })`,
      );
    }
  }

  if (repositories.length > 0 && successfulRepositories === 0) {
    throw new Error("Nenhum repositorio GitHub retornou issues com sucesso.");
  }

  return [...jobsByUrl.values()];
}

export const githubIssuesRepositoriesSource: JobSource = {
  name: "GitHub Issues Repositories",
  async fetchJobs() {
    return fetchJobsFromGitHubIssuesRepositories();
  },
};
