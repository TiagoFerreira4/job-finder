import { checkLocationEligibility } from "../filters/location-eligibility.js";
import type { SourceJob } from "../types/index.js";

const jobs: SourceJob[] = [
  {
    title: "Estagio Backend",
    location: "Recife / Presencial",
    url: "https://example.com/recife-presencial",
    source: "smoke-location",
    description: "Vaga presencial em Recife.",
  },
  {
    title: "QA Jr",
    location: "Sao Paulo / Hibrido",
    url: "https://example.com/sp-hibrido",
    source: "smoke-location",
    description: "Vaga hibrida em Sao Paulo.",
  },
  {
    title: "Frontend Jr",
    location: "100% Remoto",
    url: "https://example.com/remoto",
    source: "smoke-location",
    description: "Vaga remota para todo o Brasil.",
  },
  {
    title: "Dev Trainee",
    location: "Brasil",
    url: "https://example.com/brasil",
    source: "smoke-location",
    description: "Local amplo sem modelo de trabalho informado.",
  },
  {
    title: "Suporte Developer N1",
    url: "https://example.com/sem-local",
    source: "smoke-location",
    description: "Sem local claro.",
  },
];

console.log("[START] Smoke test Location Eligibility iniciado.");

for (const job of jobs) {
  const result = checkLocationEligibility(job);

  console.log("[JOB]");
  console.log(`Titulo: ${job.title ?? "Sem titulo"}`);
  console.log(`Local: ${job.location ?? "Sem local"}`);
  console.log(`Elegivel: ${result.isEligible ? "sim" : "nao"}`);
  console.log(`Classificacao: ${result.classification}`);
  console.log(`Motivo: ${result.reason ?? "OK"}`);
  console.log("");
}

console.log("[DONE] Smoke test Location Eligibility finalizado.");
