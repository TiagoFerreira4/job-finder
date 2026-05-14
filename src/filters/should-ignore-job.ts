import type { SourceJob } from "../types/index.js";
import { checkLocationEligibility } from "./location-eligibility.js";
import { MIN_SCORE } from "./score-job.js";
import { getSearchableJobText } from "./text.js";

export type IgnoreJobResult = {
  shouldIgnore: boolean;
  reason?: string;
  category?: "validation" | "placeholder" | "seniority" | "geography" | "score";
};

const BLOCKED_SENIORITY_TERMS = [
  "senior",
  "pleno",
  "especialista",
  "tech lead",
  "lead",
  "lider estudantil",
  "principal",
  "staff",
  "middle",
  "coordenador",
  "gerente",
];

const PLACEHOLDER_TITLE_TERMS = ["[cargo]", "empresa - localizacao"];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesTerm(text: string, term: string): boolean {
  const regex = new RegExp(`(?<![a-z0-9])${escapeRegExp(term)}(?![a-z0-9])`);

  return regex.test(text);
}

function hasValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function shouldIgnoreJob(
  job: SourceJob,
  score?: number,
): IgnoreJobResult {
  if (!hasValue(job.title)) {
    return {
      shouldIgnore: true,
      reason: "Vaga sem titulo",
      category: "validation",
    };
  }

  if (!hasValue(job.url)) {
    return {
      shouldIgnore: true,
      reason: "Vaga sem URL",
      category: "validation",
    };
  }

  const normalizedTitle = getSearchableJobText({
    title: job.title,
    source: job.source,
  });
  const placeholderTerm = PLACEHOLDER_TITLE_TERMS.find((term) =>
    normalizedTitle.includes(term),
  );

  if (placeholderTerm) {
    return {
      shouldIgnore: true,
      reason: `Titulo parece placeholder: ${placeholderTerm}`,
      category: "placeholder",
    };
  }

  const searchableText = getSearchableJobText(job);
  const blockedTerm = BLOCKED_SENIORITY_TERMS.find((term) =>
    includesTerm(searchableText, term),
  );

  if (blockedTerm) {
    return {
      shouldIgnore: true,
      reason: `Senioridade incompatível: ${blockedTerm}`,
      category: "seniority",
    };
  }

  const locationEligibility = checkLocationEligibility(job);

  if (!locationEligibility.isEligible) {
    return {
      shouldIgnore: true,
      reason: `Localizacao inviavel: ${locationEligibility.reason}`,
      category: "geography",
    };
  }

  if (score !== undefined && score < MIN_SCORE) {
    return {
      shouldIgnore: true,
      reason: `Score abaixo do minimo: ${score}`,
      category: "score",
    };
  }

  return {
    shouldIgnore: false,
  };
}
