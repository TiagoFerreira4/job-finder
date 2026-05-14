import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().trim().url("deve ser uma URL valida"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1, "e obrigatoria"),
  TELEGRAM_BOT_TOKEN: z.string().trim().min(1, "e obrigatoria"),
  TELEGRAM_CHAT_ID: z.string().trim().min(1, "e obrigatoria"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => {
      const variable = issue.path.join(".");

      return `- ${variable}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(`Variaveis de ambiente invalidas:\n${issues}`);
}

export const env = {
  supabaseUrl: parsedEnv.data.SUPABASE_URL,
  supabaseServiceRoleKey: parsedEnv.data.SUPABASE_SERVICE_ROLE_KEY,
  telegramBotToken: parsedEnv.data.TELEGRAM_BOT_TOKEN,
  telegramChatId: parsedEnv.data.TELEGRAM_CHAT_ID,
};
