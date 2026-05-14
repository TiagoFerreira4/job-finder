# Job Finder Bot

Bot em Node.js e TypeScript para buscar vagas de estagio, salvar resultados no Supabase e enviar alertas no Telegram.

## Status

Pipeline principal implementado com fontes reais via issues publicas no GitHub: busca vagas, filtra por score, evita duplicatas no Supabase e envia um digest no Telegram com as melhores oportunidades.

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

## Fontes E Alertas

A fonte padrao le issues abertas de repositorios publicos brasileiros de vagas, incluindo:

- `frontendbr/vagas`
- `backend-br/vagas`
- `react-brasil/vagas`
- `nodejsdevbr/vagas`
- `qa-brasil/vagas`
- `soujava/vagas-java`
- `datascience-br/vagas`
- `DevOps-Brasil/Vagas`

A busca prioriza oportunidades de estagio, trainee e junior em tecnologia ampla: dev, QA, dados, DevOps, mobile, produto e suporte tecnico. A fonte mockada continua no projeto apenas para smoke tests e desenvolvimento local.

Regras obrigatorias de localizacao:

- vagas em Recife/PE podem ser presenciais, hibridas ou remotas;
- vagas fora de Recife/PE so sao aceitas se forem 100% remotas;
- vagas hibridas/presenciais fora de Recife/PE sao bloqueadas;
- vagas sem local claro e sem remoto explicito sao bloqueadas.

O fluxo salva todas as vagas novas aprovadas no Supabase e envia digests paginados no Telegram, com ate 5 vagas por mensagem. Se houver mais de 5 vagas novas elegiveis, mais de um digest sera enviado.

Nas mensagens do Telegram, `Local` representa apenas o local fisico quando houver cidade/estado. A modalidade de trabalho aparece separada em `Modalidade`, com valores como `Presencial`, `Hibrido` ou `Online`.

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
