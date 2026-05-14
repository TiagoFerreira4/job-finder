import type { Job } from "../types/index.js";

const MAX_REASONS = 3;

function formatOptional(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

function formatReasons(reasons: string[]): string {
  const selectedReasons = reasons.slice(0, MAX_REASONS);

  if (selectedReasons.length === 0) {
    return "- Motivos nao informados";
  }

  return selectedReasons.map((reason) => `- ${reason}`).join("\n");
}

export function formatTelegramMessage(job: Job): string {
  return [
    "Nova vaga encontrada",
    "",
    `Titulo: ${job.title}`,
    `Empresa: ${formatOptional(job.company, "Empresa nao informada")}`,
    `Local: ${formatOptional(job.location, "Local nao informado")}`,
    `Fonte: ${job.source}`,
    `Score: ${job.score}`,
    "",
    "Motivos:",
    formatReasons(job.matchedReasons),
    "",
    "Link:",
    job.url,
  ].join("\n");
}
