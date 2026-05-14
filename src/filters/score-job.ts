import type { Job, ScoreResult, SourceJob } from "../types/index.js";
import { getSearchableJobText } from "./text.js";

export const MIN_SCORE = 5;

type ScoreRule = {
  patterns: string[];
  points: number;
  reason: string;
};

const POSITIVE_RULES: ScoreRule[] = [
  {
    patterns: ["estagio"],
    points: 5,
    reason: "Parece ser estagio",
  },
  {
    patterns: ["intern", "internship"],
    points: 4,
    reason: "Menciona internship",
  },
  {
    patterns: ["trainee"],
    points: 4,
    reason: "Menciona trainee",
  },
  {
    patterns: ["junior", "jr", "entry level", "entry-level"],
    points: 4,
    reason: "Menciona vaga junior",
  },
  {
    patterns: ["recife"],
    points: 3,
    reason: "Menciona Recife",
  },
  {
    patterns: ["remoto", "online", "home office", "home-office"],
    points: 3,
    reason: "Menciona online/remoto",
  },
  {
    patterns: ["remote"],
    points: 3,
    reason: "Menciona remote",
  },
  {
    patterns: ["hibrido"],
    points: 2,
    reason: "Menciona hibrido",
  },
  {
    patterns: ["desenvolvedor"],
    points: 2,
    reason: "Menciona desenvolvimento",
  },
  {
    patterns: ["software"],
    points: 2,
    reason: "Menciona software",
  },
  {
    patterns: ["backend"],
    points: 2,
    reason: "Menciona backend",
  },
  {
    patterns: ["frontend"],
    points: 2,
    reason: "Menciona frontend",
  },
  {
    patterns: ["front-end", "front end"],
    points: 2,
    reason: "Menciona frontend",
  },
  {
    patterns: ["fullstack"],
    points: 2,
    reason: "Menciona fullstack",
  },
  {
    patterns: ["node"],
    points: 2,
    reason: "Menciona Node.js",
  },
  {
    patterns: ["typescript"],
    points: 2,
    reason: "Menciona TypeScript",
  },
  {
    patterns: ["javascript"],
    points: 2,
    reason: "Menciona JavaScript",
  },
  {
    patterns: ["react"],
    points: 2,
    reason: "Menciona React",
  },
  {
    patterns: ["qa", "quality assurance", "testes", "tester"],
    points: 2,
    reason: "Menciona QA/testes",
  },
  {
    patterns: ["dados", "data", "data science", "data analyst"],
    points: 2,
    reason: "Menciona dados",
  },
  {
    patterns: ["devops", "dev ops", "cloud"],
    points: 2,
    reason: "Menciona DevOps/cloud",
  },
  {
    patterns: ["mobile", "android", "ios", "swift", "kotlin"],
    points: 2,
    reason: "Menciona mobile",
  },
  {
    patterns: ["suporte tecnico", "support engineer", "produto"],
    points: 1,
    reason: "Menciona area tecnica ampla",
  },
  {
    patterns: ["java"],
    points: 1,
    reason: "Menciona Java",
  },
  {
    patterns: ["python"],
    points: 1,
    reason: "Menciona Python",
  },
  {
    patterns: ["spring"],
    points: 1,
    reason: "Menciona Spring",
  },
  {
    patterns: ["api", "apis"],
    points: 1,
    reason: "Menciona APIs",
  },
];

const NEGATIVE_RULES: ScoreRule[] = [
  {
    patterns: ["senior"],
    points: -5,
    reason: "Indica senioridade alta",
  },
  {
    patterns: ["pleno"],
    points: -3,
    reason: "Indica vaga pleno",
  },
  {
    patterns: ["especialista"],
    points: -4,
    reason: "Indica vaga especialista",
  },
  {
    patterns: ["tech lead"],
    points: -5,
    reason: "Indica vaga de lideranca tecnica",
  },
  {
    patterns: ["lead", "lider estudantil", "principal", "staff", "middle"],
    points: -5,
    reason: "Indica senioridade alta",
  },
  {
    patterns: ["3 anos"],
    points: -3,
    reason: "Exige 3 anos de experiencia",
  },
  {
    patterns: ["4 anos"],
    points: -4,
    reason: "Exige 4 anos de experiencia",
  },
  {
    patterns: ["5 anos"],
    points: -5,
    reason: "Exige 5 anos de experiencia",
  },
  {
    patterns: ["gupy"],
    points: -1,
    reason: "Usa plataforma burocratica",
  },
  {
    patterns: ["solides"],
    points: -1,
    reason: "Usa plataforma burocratica",
  },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesPattern(text: string, pattern: string): boolean {
  const regex = new RegExp(`(?<![a-z0-9])${escapeRegExp(pattern)}(?![a-z0-9])`);

  return regex.test(text);
}

function includesAnyPattern(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => includesPattern(text, pattern));
}

function mentionsInternship(text: string): boolean {
  return includesAnyPattern(text, ["estagio", "intern", "internship"]);
}

export function scoreJob(job: SourceJob | Job): ScoreResult {
  const searchableText = getSearchableJobText(job);
  const matchedReasons: string[] = [];
  let score = 0;

  for (const rule of POSITIVE_RULES) {
    if (includesAnyPattern(searchableText, rule.patterns)) {
      score += rule.points;
      matchedReasons.push(rule.reason);
    }
  }

  for (const rule of NEGATIVE_RULES) {
    if (includesAnyPattern(searchableText, rule.patterns)) {
      score += rule.points;
      matchedReasons.push(rule.reason);
    }
  }

  if (includesPattern(searchableText, "pj") && !mentionsInternship(searchableText)) {
    score -= 2;
    matchedReasons.push("Menciona PJ sem indicar estagio");
  }

  return {
    score,
    matchedReasons,
  };
}
