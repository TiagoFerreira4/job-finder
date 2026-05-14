import { normalizeUrl } from "./filters/normalize-url.js";
import { scoreJob } from "./filters/score-job.js";
import { shouldIgnoreJob } from "./filters/should-ignore-job.js";
import { formatTelegramDigestMessage } from "./formatters/format-telegram-digest-message.js";
import { jobsRepository } from "./repositories/jobs-repository.js";
import { sendTelegramMessage } from "./services/telegram.js";
import { fetchJobsFromSources } from "./sources/index.js";
import type { Job, SourceJob } from "./types/index.js";

const MAX_DIGEST_JOBS = 5;

type RunStats = {
  found: number;
  invalidOrIgnored: number;
  duplicates: number;
  saved: number;
  geographicBlocked: number;
  notified: number;
  telegramMessages: number;
  failedToSend: number;
  sourceErrors: number;
};

function createInitialStats(): RunStats {
  return {
    found: 0,
    invalidOrIgnored: 0,
    duplicates: 0,
    saved: 0,
    geographicBlocked: 0,
    notified: 0,
    telegramMessages: 0,
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
    workMode: job.workMode,
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
  console.log(`[FILTER] ${stats.geographicBlocked} vagas bloqueadas por local`);
  console.log(`[DUPLICATE] ${stats.duplicates} vagas ja existiam`);
  console.log(`[SAVED] ${stats.saved} vagas novas salvas`);
  console.log(`[TELEGRAM] ${stats.telegramMessages} digests enviados`);
  console.log(`[TELEGRAM] ${stats.notified} vagas notificadas`);
  console.log(`[TELEGRAM] ${stats.failedToSend} vagas falharam no envio`);
  console.log(`[SOURCE] ${stats.sourceErrors} fontes falharam`);
}

async function processJob(
  job: SourceJob,
  stats: RunStats,
): Promise<Job | undefined> {
  const scoreResult = scoreJob(job);
  const ignore = shouldIgnoreJob(job, scoreResult.score);

  if (ignore.shouldIgnore) {
    stats.invalidOrIgnored += 1;

    if (ignore.category === "geography") {
      stats.geographicBlocked += 1;
    }

    console.log(
      `[FILTER] ${job.title ?? "Sem titulo"} ignorada: ${ignore.reason}`,
    );
    return undefined;
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
    return undefined;
  }

  const exists = await jobsRepository.existsByUrlNormalized(urlNormalized);

  if (exists) {
    stats.duplicates += 1;
    console.log(`[DUPLICATE] ${job.title}: ${urlNormalized}`);
    return undefined;
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

  return savedJob;
}

async function sendDigest(savedJobs: Job[], stats: RunStats): Promise<void> {
  if (savedJobs.length === 0) {
    console.log("[TELEGRAM] Nenhuma vaga nova para enviar no digest");
    return;
  }

  const jobsToNotify = [...savedJobs]
    .sort((a, b) => b.score - a.score);
  const totalPages = Math.ceil(jobsToNotify.length / MAX_DIGEST_JOBS);

  for (let index = 0; index < jobsToNotify.length; index += MAX_DIGEST_JOBS) {
    const pageJobs = jobsToNotify.slice(index, index + MAX_DIGEST_JOBS);
    const currentPage = index / MAX_DIGEST_JOBS + 1;

    try {
      const message = formatTelegramDigestMessage(
        pageJobs,
        savedJobs.length,
        currentPage,
        totalPages,
      );
      await sendTelegramMessage(message);
      stats.telegramMessages += 1;

      for (const job of pageJobs) {
        if (!job.id) {
          throw new Error("Vaga salva sem id retornado pelo Supabase.");
        }

        await jobsRepository.markAsSent(job.id);
        stats.notified += 1;
      }

      console.log(
        `[TELEGRAM] Digest ${currentPage}/${totalPages} enviado com ${pageJobs.length} vagas`,
      );
    } catch (error) {
      stats.failedToSend += pageJobs.length;

      for (const job of pageJobs) {
        if (job.id) {
          await jobsRepository.markAsFailed(job.id, error);
        }
      }

      console.log(
        `[TELEGRAM] Falha ao enviar digest ${currentPage}/${totalPages}: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
      );
    }
  }
}

async function main() {
  const stats = createInitialStats();

  console.log("[START] Buscando vagas...");

  const savedJobs: Job[] = [];
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
    const savedJob = await processJob(job, stats);

    if (savedJob) {
      savedJobs.push(savedJob);
    }
  }

  await sendDigest(savedJobs, stats);
  logSummary(stats);
  console.log("[DONE] Execucao finalizada.");
}

await main();
