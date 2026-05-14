import { scoreJob } from "../filters/score-job.js";
import { shouldIgnoreJob } from "../filters/should-ignore-job.js";
import type { SourceJob } from "../types/index.js";

const jobs: SourceJob[] = [
  {
    title: "Estagio em Desenvolvimento Fullstack",
    company: "Empresa Boa",
    location: "Recife / Remoto",
    url: "https://example.com/jobs/estagio-fullstack",
    source: "smoke-filters",
    description: "Vaga com Node, TypeScript, React, backend, frontend e APIs.",
  },
  {
    title: "Desenvolvedor Backend Senior",
    company: "Empresa Senior",
    location: "Remoto",
    url: "https://example.com/jobs/backend-senior",
    source: "smoke-filters",
    description: "Vaga para senior com Node, TypeScript e 5 anos de experiencia.",
  },
  {
    title: "Estagio em Software",
    company: "Empresa Sem URL",
    location: "Recife",
    source: "smoke-filters",
    description: "Vaga de estagio em desenvolvimento de software.",
  },
  {
    company: "Empresa Sem Titulo",
    location: "Recife",
    url: "https://example.com/jobs/sem-titulo",
    source: "smoke-filters",
    description: "Vaga de estagio em desenvolvimento de software.",
  },
  {
    title: "Assistente Administrativo",
    company: "Empresa Baixo Score",
    location: "Presencial",
    url: "https://example.com/jobs/assistente-administrativo",
    source: "smoke-filters",
    description: "Atividades administrativas e atendimento interno.",
  },
];

for (const job of jobs) {
  const result = scoreJob(job);
  const ignore = shouldIgnoreJob(job, result.score);

  console.log("[JOB]");
  console.log(`Titulo: ${job.title ?? "Sem titulo"}`);
  console.log(`Score: ${result.score}`);
  console.log(`Motivos: ${result.matchedReasons.join(", ") || "Nenhum"}`);
  console.log(
    `Ignorar: ${ignore.shouldIgnore ? `sim (${ignore.reason})` : "nao"}`,
  );
  console.log("");
}
