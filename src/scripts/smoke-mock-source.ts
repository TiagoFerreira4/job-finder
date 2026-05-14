import { scoreJob } from "../filters/score-job.js";
import { shouldIgnoreJob } from "../filters/should-ignore-job.js";
import { mockSource } from "../sources/mock-source.js";

console.log("[START] Smoke test Mock Source iniciado.");

const jobs = await mockSource.fetchJobs();

console.log(`[SOURCE] ${mockSource.name}: ${jobs.length} vagas encontradas`);

for (const job of jobs) {
  const result = scoreJob(job);
  const ignore = shouldIgnoreJob(job, result.score);

  console.log("[JOB]");
  console.log(`Titulo: ${job.title ?? "Sem titulo"}`);
  console.log(`URL: ${job.url ?? "Sem URL"}`);
  console.log(`Score: ${result.score}`);
  console.log(`Motivos: ${result.matchedReasons.join(", ") || "Nenhum"}`);
  console.log(
    `Ignorar: ${ignore.shouldIgnore ? `sim (${ignore.reason})` : "nao"}`,
  );
  console.log("");
}

console.log("[DONE] Smoke test Mock Source finalizado.");
