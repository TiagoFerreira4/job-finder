import { env } from "../config/env.js";

type TelegramSendMessageResponse =
  | {
      ok: true;
      result: unknown;
    }
  | {
      ok: false;
      description?: string;
    };

function assertMessage(message: string): void {
  if (!message.trim()) {
    throw new Error("Mensagem do Telegram nao pode ser vazia.");
  }
}

function getTelegramErrorMessage(response: TelegramSendMessageResponse): string {
  if (response.ok) {
    return "Erro desconhecido do Telegram.";
  }

  return response.description ?? "Telegram retornou erro sem descricao.";
}

export async function sendTelegramMessage(message: string): Promise<void> {
  assertMessage(message);

  const response = await fetch(
    `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        chat_id: env.telegramChatId,
        text: message,
      }),
    },
  );

  let payload: TelegramSendMessageResponse;

  try {
    payload = (await response.json()) as TelegramSendMessageResponse;
  } catch {
    throw new Error("Telegram retornou uma resposta invalida.");
  }

  if (!response.ok) {
    throw new Error(
      `Telegram retornou HTTP ${response.status}: ${getTelegramErrorMessage(payload)}`,
    );
  }

  if (!payload.ok) {
    throw new Error(`Telegram recusou a mensagem: ${getTelegramErrorMessage(payload)}`);
  }
}
