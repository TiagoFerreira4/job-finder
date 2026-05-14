import { normalizeUrl } from "./filters/normalize-url.js";
import { scoreJob } from "./filters/score-job.js";
import { shouldIgnoreJob } from "./filters/should-ignore-job.js";
import { formatTelegramMessage } from "./formatters/format-telegram-message.js";
import { jobsRepository } from "./repositories/jobs-repository.js";
import { sendTelegramMessage } from "./services/telegram.js";
import { fetchJobsFromSources } from "./sources/index.js";
import type { Job, SourceJob } from "./types/index.js";

const MAX_NEW_JOBS_PER_RUN = 5;

type RunStats = {
  found: number;
  invalidOrIgnored: number;
  duplicates: number;
  saved: number;
  sent: number;
  failedToSend: number;
  sourceErrors: number;
};

function createInitialStats(): RunStats {
  return {
    found: 0,
    invalidOrIgnored: 0,
    duplicates: 0,
    saved: 0,
    sent: 0,
    failedToSend: 0,
    sourceErrors: 0,
  };
}

function buildJob(
  job: SourceJob,
  urlNormalized: string,
  score: number,
  matchedReasons: string[],
): Job {
  return {
    title: job.title ?? "",
    company: job.company,
    location: job.location,
    url: job.url ?? "",
    urlNormalized,
    source: job.source,
    description: job.description,
    score,
    matchedReasons,
    rawPayload: job.rawPayload,
    status: "new",
  };
}

function logSummary(stats: RunStats): void {
  console.log(`[FOUND] ${stats.found} vagas encontradas`);
  console.log(`[FILTER] ${stats.invalidOrIgnored} vagas ignoradas`);
  console.log(`[DUPLICATE] ${stats.duplicates} vagas ja existiam`);
  console.log(`[SAVED] ${stats.saved} vagas novas salvas`);
  console.log(`[TELEGRAM] ${stats.sent} mensagens enviadas`);
  console.log(`[TELEGRAM] ${stats.failedToSend} mensagens falharam`);
  console.log(`[SOURCE] ${stats.sourceErrors} fontes falharam`);
}

async function processJob(job: SourceJob, stats: RunStats): Promise<void> {
  const scoreResult = scoreJob(job);
  const ignore = shouldIgnoreJob(job, scoreResult.score);

  if (ignore.shouldIgnore) {
    stats.invalidOrIgnored += 1;
    console.log(
      `[FILTER] ${job.title ?? "Sem titulo"} ignorada: ${ignore.reason}`,
    );
    return;
  }

  let urlNormalized: string;

  try {
    urlNormalized = normalizeUrl(job.url ?? "");
  } catch (error) {
    stats.invalidOrIgnored += 1;
    console.log(
      `[FILTER] ${job.title ?? "Sem titulo"} ignorada: ${
        error instanceof Error ? error.message : "URL invalida"
      }`,
    );
    return;
  }

  const exists = await jobsRepository.existsByUrlNormalized(urlNormalized);

  if (exists) {
    stats.duplicates += 1;
    console.log(`[DUPLICATE] ${job.title}: ${urlNormalized}`);
    return;
  }

  const jobToCreate = buildJob(
    job,
    urlNormalized,
    scoreResult.score,
    scoreResult.matchedReasons,
  );

  const savedJob = await jobsRepository.create(jobToCreate);
  stats.saved += 1;
  console.log(`[SAVED] ${savedJob.title}`);

  try {
    const message = formatTelegramMessage(savedJob);
    await sendTelegramMessage(message);

    if (!savedJob.id) {
      throw new Error("Vaga salva sem id retornado pelo Supabase.");
    }

    await jobsRepository.markAsSent(savedJob.id);
    stats.sent += 1;
    console.log(`[TELEGRAM] Mensagem enviada para ${savedJob.title}`);
  } catch (error) {
    stats.failedToSend += 1;

    if (savedJob.id) {
      await jobsRepository.markAsFailed(savedJob.id, error);
    }

    console.log(
      `[TELEGRAM] Falha ao enviar ${savedJob.title}: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`,
    );
  }
}

async function main() {
  const stats = createInitialStats();

  console.log("[START] Buscando vagas...");

  const { jobs, summary } = await fetchJobsFromSources();
  stats.found = jobs.length;
  stats.sourceErrors = summary.filter((source) => !source.success).length;

  for (const sourceSummary of summary) {
    if (sourceSummary.success) {
      console.log(
        `[SOURCE] ${sourceSummary.source}: ${sourceSummary.found} vagas encontradas`,
      );
      continue;
    }

    console.log(
      `[SOURCE] ${sourceSummary.source}: falhou (${sourceSummary.error})`,
    );
  }

  for (const job of jobs) {
    if (stats.saved >= MAX_NEW_JOBS_PER_RUN) {
      console.log(
        `[LIMIT] Limite de ${MAX_NEW_JOBS_PER_RUN} vagas novas por execucao atingido`,
      );
      break;
    }

    await processJob(job, stats);
  }

  logSummary(stats);
  console.log("[DONE] Execucao finalizada.");
}

await main();
