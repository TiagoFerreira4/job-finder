import type { SourceJob, WorkMode } from "../types/index.js";
import { getSearchableJobText } from "./text.js";

function includesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

export function inferWorkMode(job: SourceJob): WorkMode {
  const text = getSearchableJobText(job);

  if (
    includesAny(text, [
      /(?<![a-z0-9])hibrido(?![a-z0-9])/,
      /(?<![a-z0-9])hybrid(?![a-z0-9])/,
    ])
  ) {
    return "hybrid";
  }

  if (
    includesAny(text, [
      /(?<![a-z0-9])presencial(?![a-z0-9])/,
      /(?<![a-z0-9])onsite(?![a-z0-9])/,
      /(?<![a-z0-9])on-site(?![a-z0-9])/,
    ])
  ) {
    return "presential";
  }

  if (
    includesAny(text, [
      /(?<![a-z0-9])remoto(?![a-z0-9])/,
      /(?<![a-z0-9])remote(?![a-z0-9])/,
      /(?<![a-z0-9])anywhere(?![a-z0-9])/,
      /(?<![a-z0-9])home office(?![a-z0-9])/,
      /(?<![a-z0-9])home-office(?![a-z0-9])/,
      /(?<![a-z0-9])100% online(?![a-z0-9])/,
      /(?<![a-z0-9])100% remoto(?![a-z0-9])/,
      /(?<![a-z0-9])totalmente remoto(?![a-z0-9])/,
    ])
  ) {
    return "online";
  }

  return "unknown";
}

export function formatWorkMode(workMode: WorkMode | undefined): string {
  switch (workMode) {
    case "online":
      return "Online";
    case "hybrid":
      return "Hibrido";
    case "presential":
      return "Presencial";
    default:
      return "Nao informada";
  }
}
