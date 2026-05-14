import { normalizeUrl } from "../filters/normalize-url.js";
import { formatTelegramDigestMessage } from "../formatters/format-telegram-digest-message.js";
import { formatTelegramMessage } from "../formatters/format-telegram-message.js";
import type { Job } from "../types/index.js";

const job: Job = {
  title: "Estagio em Desenvolvimento Web",
  company: "Empresa Exemplo",
  location: "Recife/PE",
  workMode: "hybrid",
  url: "https://example.com/jobs/123?utm_source=linkedin",
  urlNormalized: "https://example.com/jobs/123",
  source: "smoke-formatters",
  description: "Vaga fake para validar formatter.",
  score: 8,
  matchedReasons: [
    "Parece ser estagio",
    "Menciona Recife ou remoto",
    "Menciona tecnologias compativeis",
    "Motivo extra que nao deve aparecer",
  ],
  rawPayload: {
    createdBy: "smoke-formatters",
  },
  status: "new",
};

const urls = [
  "https://Example.com/jobs/123?utm_source=linkedin&utm_medium=social",
  "https://example.com/jobs/123?fbclid=abc123",
  "https://example.com/jobs/123?jobId=456&utm_campaign=test",
  "https://example.com/jobs/123/",
];

console.log("[MESSAGE]");
console.log(formatTelegramMessage(job));
console.log("");
console.log("[DIGEST]");
console.log(formatTelegramDigestMessage([job], 1, 1, 1));
console.log("");
console.log("[URLS]");

for (const url of urls) {
  console.log(`${url} -> ${normalizeUrl(url)}`);
}
