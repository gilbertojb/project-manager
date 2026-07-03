# Project Manager — Regras do Agente

## Sobre o Projeto

Sistema de gerenciamento de projetos com análise de risco automática e análise executiva via IA (Anthropic, Gemini ou OpenAI). API REST em NestJS com persistência PostgreSQL via Prisma, e frontend SPA em React 19 + Vite 6 + TailwindCSS v4.

## Estrutura do Repositório

```
project-manager/
  backend/          ← API NestJS (ver backend/CLAUDE.md)
  frontend/         ← SPA React (ver frontend/CLAUDE.md)
  docs/
    specs/          ← design specs numeradas (01–08)
    plans/          ← planos de implementação com código
  docker-compose.yml está em backend/ (infraestrutura do backend)
  client.http       ← exemplos de chamadas à API (VSCode REST Client)
  AI_USAGE.md       ← documentação do uso de IA no projeto
```

## Convenções Globais

- **Specs:** salvar em `docs/specs/YYYY-MM-DD-NN-nome.md` (numeradas)
- **Planos:** salvar em `docs/plans/YYYY-MM-DD-nome.md`
- **Commits:** sem linha `Co-Authored-By`; mensagens em inglês
- **Branches:** trabalho direto em `main` até haver time maior

## Projetos

- `backend/` — ver `backend/CLAUDE.md` para stack, arquitetura e comandos
- `frontend/` — ver `frontend/CLAUDE.md` para stack, estrutura e comandos

## Metodologia

Spec Driven Development com skills do Superpowers:

1. `superpowers:brainstorming` → design + aprovação
2. `superpowers:writing-plans` → plano em `docs/plans/`
3. `superpowers:subagent-driven-development` → execução com review loop
