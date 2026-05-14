import { formatWorkMode, inferWorkMode } from "../filters/work-mode.js";
import type { Job } from "../types/index.js";

const MAX_REASONS_PER_JOB = 2;

function formatOptional(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

function formatReasons(reasons: string[]): string {
  const selectedReasons = reasons.slice(0, MAX_REASONS_PER_JOB);

  if (selectedReasons.length === 0) {
    return "motivos nao informados";
  }

  return selectedReasons.join("; ");
}

function formatJob(job: Job, index: number): string {
  return [
    `${index + 1}. ${job.title}`,
    `Empresa: ${formatOptional(job.company, "Nao informada")}`,
    `Local: ${formatOptional(job.location, "Nao informado")}`,
    `Modalidade: ${formatWorkMode(job.workMode ?? inferWorkMode(job))}`,
    `Fonte: ${job.source}`,
    `Score: ${job.score}`,
    `Motivos: ${formatReasons(job.matchedReasons)}`,
    job.url,
  ].join("\n");
}

export function formatTelegramDigestMessage(
  jobs: Job[],
  totalSaved: number,
  page: number,
  totalPages: number,
): string {
  const header = [
    `Job Finder: vagas novas ${page}/${totalPages}`,
    `Total salvo nesta execucao: ${totalSaved}`,
  ];

  return [
    ...header,
    "",
    ...jobs.flatMap((job, index) => [formatJob(job, index), ""]),
  ]
    .join("\n")
    .trim();
}
