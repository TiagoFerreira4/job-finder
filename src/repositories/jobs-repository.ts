import { supabase } from "../services/supabase.js";
import type { Job, JobStatus } from "../types/index.js";

type JobRow = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  url: string;
  url_normalized: string;
  fingerprint: string | null;
  source: string | null;
  description: string | null;
  score: number | null;
  matched_reasons: string[] | null;
  raw_payload: unknown;
  status: JobStatus | null;
  found_at: string | null;
  sent_at: string | null;
  last_error: string | null;
};

type JobInsert = {
  title: string;
  company?: string;
  location?: string;
  url: string;
  url_normalized: string;
  fingerprint?: string;
  source?: string;
  description?: string;
  score: number;
  matched_reasons: string[];
  raw_payload?: unknown;
  status: JobStatus;
  found_at?: string;
  sent_at?: string;
  last_error?: string;
};

function mapRowToJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company ?? undefined,
    location: row.location ?? undefined,
    url: row.url,
    urlNormalized: row.url_normalized,
    fingerprint: row.fingerprint ?? undefined,
    source: row.source ?? "unknown",
    description: row.description ?? undefined,
    score: row.score ?? 0,
    matchedReasons: row.matched_reasons ?? [],
    rawPayload: row.raw_payload ?? undefined,
    status: row.status ?? "new",
    foundAt: row.found_at ? new Date(row.found_at) : undefined,
    sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
    lastError: row.last_error ?? undefined,
  };
}

function mapJobToInsert(job: Job): JobInsert {
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    url: job.url,
    url_normalized: job.urlNormalized,
    fingerprint: job.fingerprint,
    source: job.source,
    description: job.description,
    score: job.score,
    matched_reasons: job.matchedReasons,
    raw_payload: job.rawPayload,
    status: job.status,
    found_at: job.foundAt?.toISOString(),
    sent_at: job.sentAt?.toISOString(),
    last_error: job.lastError,
  };
}

function serializeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Erro desconhecido";
  }
}

function assertJobId(id: string): void {
  if (!id.trim()) {
    throw new Error("Job id e obrigatorio para atualizar status.");
  }
}

export const jobsRepository = {
  async existsByUrlNormalized(urlNormalized: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("jobs")
      .select("id")
      .eq("url_normalized", urlNormalized)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Erro ao consultar duplicidade por url_normalized: ${error.message}`,
      );
    }

    return data !== null;
  },

  async create(job: Job): Promise<Job> {
    const { data, error } = await supabase
      .from("jobs")
      .insert(mapJobToInsert(job))
      .select("*")
      .single();

    if (error) {
      throw new Error(`Erro ao criar vaga no Supabase: ${error.message}`);
    }

    return {
      ...mapRowToJob(data as JobRow),
      workMode: job.workMode,
    };
  },

  async markAsSent(id: string): Promise<void> {
    assertJobId(id);

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Erro ao marcar vaga como enviada: ${error.message}`);
    }
  },

  async markAsFailed(id: string, error: unknown): Promise<void> {
    assertJobId(id);

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "failed",
        last_error: serializeError(error),
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(
        `Erro ao marcar vaga como falha: ${updateError.message}`,
      );
    }
  },
};
