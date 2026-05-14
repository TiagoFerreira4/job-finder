import type { JobSource, SourceJob } from "../types/index.js";

const jobs: SourceJob[] = [
  {
    title: "Estagio em Desenvolvimento Fullstack",
    company: "Empresa Boa",
    location: "Recife / Remoto",
    url: "https://example.com/jobs/estagio-fullstack",
    source: "Mock Source",
    description: "Vaga com Node, TypeScript, React, backend, frontend e APIs.",
    rawPayload: {
      kind: "good-internship",
    },
  },
  {
    title: "Estagio em Desenvolvimento Fullstack",
    company: "Empresa Boa",
    location: "Recife / Remoto",
    url: "https://example.com/jobs/estagio-fullstack",
    source: "Mock Source",
    description: "Duplicata da vaga boa para validar deduplicacao futura.",
    rawPayload: {
      kind: "duplicate-internship",
    },
  },
  {
    title: "Desenvolvedor Backend Senior",
    company: "Empresa Senior",
    location: "Remoto",
    url: "https://example.com/jobs/backend-senior",
    source: "Mock Source",
    description: "Vaga para senior com Node, TypeScript e 5 anos de experiencia.",
    rawPayload: {
      kind: "senior",
    },
  },
  {
    title: "Estagio em Software",
    company: "Empresa Sem URL",
    location: "Recife",
    source: "Mock Source",
    description: "Vaga de estagio em desenvolvimento de software.",
    rawPayload: {
      kind: "missing-url",
    },
  },
  {
    company: "Empresa Sem Titulo",
    location: "Recife",
    url: "https://example.com/jobs/sem-titulo",
    source: "Mock Source",
    description: "Vaga de estagio em desenvolvimento de software.",
    rawPayload: {
      kind: "missing-title",
    },
  },
  {
    title: "Assistente Administrativo",
    company: "Empresa Baixo Score",
    location: "Presencial",
    url: "https://example.com/jobs/assistente-administrativo",
    source: "Mock Source",
    description: "Atividades administrativas e atendimento interno.",
    rawPayload: {
      kind: "low-score",
    },
  },
];

export const mockSource: JobSource = {
  name: "Mock Source",
  async fetchJobs() {
    return jobs;
  },
};
