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
    `Fonte: ${job.source}`,
    `Score: ${job.score}`,
    `Motivos: ${formatReasons(job.matchedReasons)}`,
    job.url,
  ].join("\n");
}

export function formatTelegramDigestMessage(
  jobs: Job[],
  totalSaved: number,
): string {
  const hiddenJobs = Math.max(totalSaved - jobs.length, 0);
  const header = [
    `Job Finder: ${jobs.length} melhores vagas novas`,
    `Total salvo nesta execucao: ${totalSaved}`,
  ];

  if (hiddenJobs > 0) {
    header.push(`Outras vagas salvas sem alerta: ${hiddenJobs}`);
  }

  return [
    ...header,
    "",
    ...jobs.flatMap((job, index) => [formatJob(job, index), ""]),
  ]
    .join("\n")
    .trim();
}
