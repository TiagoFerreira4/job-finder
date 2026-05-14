import { sendTelegramMessage } from "../services/telegram.js";

async function main() {
  console.log("[START] Smoke test Telegram iniciado.");

  await sendTelegramMessage(
    "Smoke test do Job Finder Bot: Telegram configurado com sucesso.",
  );

  console.log("[TELEGRAM] Mensagem de teste enviada.");
  console.log("[DONE] Smoke test Telegram finalizado.");
}

await main();
