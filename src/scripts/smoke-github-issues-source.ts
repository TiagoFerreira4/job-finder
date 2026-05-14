import { scoreJob } from "../filters/score-job.js";
import { shouldIgnoreJob } from "../filters/should-ignore-job.js";
import { fetchJobsFromGitHubIssuesRepositories } from "../sources/github-issues-repositories-source.js";
import type { GitHubIssuesRepositoryConfig } from "../sources/sources-config.js";

const repositories: GitHubIssuesRepositoryConfig[] = [
  {
    owner: "frontendbr",
    repo: "vagas",
    sourceName: "GitHub frontendbr/vagas",
    category: "frontend",
    priority: 1,
    enabled: true,
  },
  {
    owner: "backend-br",
    repo: "vagas",
    sourceName: "GitHub backend-br/vagas",
    category: "backend",
    priority: 1,
    enabled: true,
  },
];

console.log("[START] Smoke test GitHub Issues Source iniciado.");

const jobs = await fetchJobsFromGitHubIssuesRepositories(repositories);

console.log(`[TOTAL] ${jobs.length} vagas candidatas encontradas`);

for (const job of jobs.slice(0, 10)) {
  const result = scoreJob(job);
  const ignore = shouldIgnoreJob(job, result.score);

  console.log("[JOB]");
  console.log(`Titulo: ${job.title ?? "Sem titulo"}`);
  console.log(`Fonte: ${job.source}`);
  console.log(`URL: ${job.url ?? "Sem URL"}`);
  console.log(`Score: ${result.score}`);
  console.log(`Motivos: ${result.matchedReasons.join(", ") || "Nenhum"}`);
  console.log(
    `Ignorar: ${ignore.shouldIgnore ? `sim (${ignore.reason})` : "nao"}`,
  );
  console.log("");
}

console.log("[DONE] Smoke test GitHub Issues Source finalizado.");
