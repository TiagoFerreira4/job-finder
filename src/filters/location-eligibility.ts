import type { SourceJob } from "../types/index.js";
import { getSearchableJobText } from "./text.js";

export type LocationEligibilityClassification =
  | "recife"
  | "remote"
  | "blocked_hybrid"
  | "blocked_presential"
  | "unknown";

export type LocationEligibilityResult = {
  isEligible: boolean;
  classification: LocationEligibilityClassification;
  reason?: string;
};

function includesTerm(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

function mentionsRecife(text: string): boolean {
  return (
    includesTerm(text, /(?<![a-z0-9])recife(?![a-z0-9])/) ||
    includesTerm(text, /(?<![a-z0-9])pernambuco(?![a-z0-9])/) ||
    includesTerm(text, /(?<![a-z0-9])pe(?![a-z0-9])/)
  );
}

function mentionsRemote(text: string): boolean {
  return [
    /(?<![a-z0-9])remoto(?![a-z0-9])/,
    /(?<![a-z0-9])remote(?![a-z0-9])/,
    /(?<![a-z0-9])anywhere(?![a-z0-9])/,
    /(?<![a-z0-9])home office(?![a-z0-9])/,
    /(?<![a-z0-9])home-office(?![a-z0-9])/,
    /(?<![a-z0-9])100% online(?![a-z0-9])/,
    /(?<![a-z0-9])100% remoto(?![a-z0-9])/,
    /(?<![a-z0-9])totalmente remoto(?![a-z0-9])/,
  ].some((pattern) => includesTerm(text, pattern));
}

function deniesRemote(text: string): boolean {
  return [
    /(?<![a-z0-9])nao remoto(?![a-z0-9])/,
    /(?<![a-z0-9])sem remoto(?![a-z0-9])/,
    /(?<![a-z0-9])not remote(?![a-z0-9])/,
    /(?<![a-z0-9])no remote(?![a-z0-9])/,
  ].some((pattern) => includesTerm(text, pattern));
}

function mentionsHybrid(text: string): boolean {
  return (
    includesTerm(text, /(?<![a-z0-9])hibrido(?![a-z0-9])/) ||
    includesTerm(text, /(?<![a-z0-9])hybrid(?![a-z0-9])/)
  );
}

function mentionsPresential(text: string): boolean {
  return (
    includesTerm(text, /(?<![a-z0-9])presencial(?![a-z0-9])/) ||
    includesTerm(text, /(?<![a-z0-9])onsite(?![a-z0-9])/) ||
    includesTerm(text, /(?<![a-z0-9])on-site(?![a-z0-9])/)
  );
}

export function checkLocationEligibility(
  job: SourceJob,
): LocationEligibilityResult {
  const searchableText = getSearchableJobText(job);

  if (mentionsRecife(searchableText)) {
    return {
      isEligible: true,
      classification: "recife",
    };
  }

  if (mentionsHybrid(searchableText)) {
    return {
      isEligible: false,
      classification: "blocked_hybrid",
      reason: "Fora de Recife e menciona hibrido",
    };
  }

  if (mentionsPresential(searchableText)) {
    return {
      isEligible: false,
      classification: "blocked_presential",
      reason: "Fora de Recife e menciona presencial",
    };
  }

  if (deniesRemote(searchableText)) {
    return {
      isEligible: false,
      classification: "unknown",
      reason: "Fora de Recife e remoto foi negado",
    };
  }

  if (mentionsRemote(searchableText)) {
    return {
      isEligible: true,
      classification: "remote",
    };
  }

  return {
    isEligible: false,
    classification: "unknown",
    reason: "Local nao e Recife e remoto nao esta explicito",
  };
}
