# Job Finder Bot

Bot em Node.js e TypeScript para buscar vagas de estagio, salvar resultados no Supabase e enviar alertas no Telegram.

## Status

Pipeline principal implementado com fonte mockada: busca vagas, filtra por score, evita duplicatas no Supabase e envia alertas no Telegram.

A primeira execucao no GitHub Actions deve ser manual. O agendamento por cron sera ativado depois que a execucao manual passar no GitHub.

## Stack

- Node.js 22
- TypeScript
- Supabase/Postgres
- GitHub Actions
- Telegram Bot API

## Setup local

```sh
npm install
cp .env.example .env
npm run typecheck
npm run search-jobs
```

Preencha o `.env` com:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Scripts

- `npm run dev`: executa a busca localmente.
- `npm run search-jobs`: comando usado pelo GitHub Actions.
- `npm run typecheck`: valida os tipos TypeScript.

## GitHub Actions

O workflow fica em `.github/workflows/search-jobs.yml` e roda manualmente via `workflow_dispatch`.

Configure os secrets no GitHub em `Settings > Secrets and variables > Actions > New repository secret`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Depois rode manualmente:

1. Abra a aba `Actions` no GitHub.
2. Selecione `Buscar vagas de estagio`.
3. Clique em `Run workflow`.
4. Confirme nos logs que `npm run typecheck` e `npm run search-jobs` passaram.
5. Confirme que a mensagem chegou no Telegram.

Quando a execucao manual estiver validada, o cron pode ser ativado no workflow:

```yaml
schedule:
  - cron: "17 * * * *"
```
