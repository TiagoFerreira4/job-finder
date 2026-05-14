import { fetchJobsFromSources } from "../sources/index.js";
import { mockSource } from "../sources/mock-source.js";
import type { JobSource } from "../types/index.js";

const failingSource: JobSource = {
  name: "Failing Source",
  async fetchJobs() {
    throw new Error("Falha intencional para testar o agregador.");
  },
};

console.log("[START] Smoke test Sources iniciado.");

const result = await fetchJobsFromSources([mockSource, failingSource]);

console.log(`[TOTAL] ${result.jobs.length} vagas encontradas`);

for (const sourceSummary of result.summary) {
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

console.log("[DONE] Smoke test Sources finalizado.");
