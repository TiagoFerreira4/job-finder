export type JobStatus = "new" | "sent" | "failed";
export type WorkMode = "online" | "hybrid" | "presential" | "unknown";

export type ScoreResult = {
  score: number;
  matchedReasons: string[];
};

export type SourceJob = {
  title?: string;
  company?: string;
  location?: string;
  workMode?: WorkMode;
  url?: string;
  source: string;
  description?: string;
  rawPayload?: unknown;
};

export type Job = {
  id?: string;
  title: string;
  company?: string;
  location?: string;
  workMode?: WorkMode;
  url: string;
  urlNormalized: string;
  fingerprint?: string;
  source: string;
  description?: string;
  score: number;
  matchedReasons: string[];
  rawPayload?: unknown;
  status: JobStatus;
  foundAt?: Date;
  sentAt?: Date;
  lastError?: string;
};

export type ScoredJob = Job & ScoreResult;
