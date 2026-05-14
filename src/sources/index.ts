import type { JobSource, SourceJob } from "../types/index.js";
import { githubSearchSource } from "./github-search-source.js";

export type SourceExecutionSummary = {
  source: string;
  found: number;
  success: boolean;
  error?: string;
};

export type FetchJobsFromSourcesResult = {
  jobs: SourceJob[];
  summary: SourceExecutionSummary[];
};

export const jobSources: JobSource[] = [githubSearchSource];

function serializeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Erro desconhecido";
  }
}

export async function fetchJobsFromSources(
  sources: JobSource[] = jobSources,
): Promise<FetchJobsFromSourcesResult> {
  const jobs: SourceJob[] = [];
  const summary: SourceExecutionSummary[] = [];

  for (const source of sources) {
    try {
      const sourceJobs = await source.fetchJobs();

      jobs.push(...sourceJobs);
      summary.push({
        source: source.name,
        found: sourceJobs.length,
        success: true,
      });
    } catch (error) {
      summary.push({
        source: source.name,
        found: 0,
        success: false,
        error: serializeError(error),
      });
    }
  }

  return {
    jobs,
    summary,
  };
}
