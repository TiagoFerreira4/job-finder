import { jobsRepository } from "../repositories/jobs-repository.js";
import type { Job } from "../types/index.js";

function buildSmokeJob(kind: "sent" | "failed"): Job {
  const suffix = kind === "sent" ? "success" : "failure";

  return {
    title: `Smoke Test Supabase ${suffix}`,
    company: "Job Finder Bot",
    location: "Recife/PE",
    workMode: "online",
    url: `https://example.com/jobs/job-finder-smoke-${suffix}`,
    urlNormalized: `https://example.com/jobs/job-finder-smoke-${suffix}`,
    fingerprint: `job-finder-smoke-${suffix}`,
    source: "smoke-supabase",
    description: "Registro fake para validar persistencia no Supabase.",
    score: 10,
    matchedReasons: ["Smoke test do Supabase"],
    rawPayload: {
      kind,
      createdBy: "smoke-supabase",
    },
    status: "new",
  };
}

async function ensureSmokeJob(job: Job): Promise<Job | null> {
  const exists = await jobsRepository.existsByUrlNormalized(job.urlNormalized);

  if (exists) {
    console.log(`[DUPLICATE] ${job.urlNormalized} ja existe.`);
    return null;
  }

  const createdJob = await jobsRepository.create(job);
  console.log(`[SAVED] Vaga fake criada com id ${createdJob.id}.`);

  return createdJob;
}

async function main() {
  console.log("[START] Smoke test Supabase iniciado.");

  const sentJob = await ensureSmokeJob(buildSmokeJob("sent"));

  if (sentJob?.id) {
    await jobsRepository.markAsSent(sentJob.id);
    console.log(`[UPDATED] Vaga ${sentJob.id} marcada como sent.`);
  }

  const failedJob = await ensureSmokeJob(buildSmokeJob("failed"));

  if (failedJob?.id) {
    await jobsRepository.markAsFailed(
      failedJob.id,
      new Error("Falha fake para validar last_error."),
    );
    console.log(`[UPDATED] Vaga ${failedJob.id} marcada como failed.`);
  }

  console.log("[DONE] Smoke test Supabase finalizado.");
}

await main();
