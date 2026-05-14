import type { SourceJob } from "../types/index.js";
import { MIN_SCORE } from "./score-job.js";
import { getSearchableJobText } from "./text.js";

export type IgnoreJobResult = {
  shouldIgnore: boolean;
  reason?: string;
};

const BLOCKED_SENIORITY_TERMS = [
  "senior",
  "pleno",
  "especialista",
  "tech lead",
];

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
    };
  }

  if (!hasValue(job.url)) {
    return {
      shouldIgnore: true,
      reason: "Vaga sem URL",
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
    };
  }

  if (score !== undefined && score < MIN_SCORE) {
    return {
      shouldIgnore: true,
      reason: `Score abaixo do minimo: ${score}`,
    };
  }

  return {
    shouldIgnore: false,
  };
}
