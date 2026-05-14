# Job Finder Bot

Bot em Node.js e TypeScript para buscar vagas de estagio, salvar resultados no Supabase e enviar alertas no Telegram.

## Status

Pipeline principal implementado com fonte real via GitHub Search: busca vagas, filtra por score, evita duplicatas no Supabase e envia alertas no Telegram.

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
- `GITHUB_TOKEN` opcional para aumentar o limite da GitHub API localmente

## Scripts

- `npm run dev`: executa a busca localmente.
- `npm run search-jobs`: comando usado pelo GitHub Actions.
- `npm run typecheck`: valida os tipos TypeScript.

## Fontes

A fonte padrao usa GitHub Search em repositorios publicos brasileiros de vagas:

- `frontendbr/vagas`
- `backend-br/vagas`

A busca prioriza vagas de estagio e junior em remoto/Recife. A fonte mockada continua no projeto apenas para smoke tests e desenvolvimento local. O fluxo padrao processa no maximo 5 vagas novas por execucao para evitar excesso de mensagens.

## GitHub Actions

O workflow fica em `.github/workflows/search-jobs.yml` e roda manualmente via `workflow_dispatch`.

Configure os secrets no GitHub em `Settings > Secrets and variables > Actions > New repository secret`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

O workflow usa o `GITHUB_TOKEN` interno do GitHub Actions automaticamente, entao nao e necessario criar esse secret no repositorio.

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
