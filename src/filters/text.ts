import type { Job, SourceJob } from "../types/index.js";

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function getSearchableJobText(job: Job | SourceJob): string {
  return normalizeText(
    [
      job.title,
      job.company,
      job.location,
      job.workMode,
      job.source,
      job.description,
    ]
      .filter(Boolean)
      .join(" "),
  );
}
