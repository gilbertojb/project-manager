# Spec 06 — Reorganização como Monorepo

**Data:** 2026-07-02
**Commit:** 28d80e7
**Status:** Implementado

---

## Objetivo

Preparar o repositório para receber um segundo projeto (frontend) movendo todo o backend para uma subpasta dedicada.

---

## Mudança

Todos os arquivos que estavam na raiz do repositório foram movidos para `backend/`:

```
antes:  /src/, /package.json, /biome.json, ...
depois: /backend/src/, /backend/package.json, /backend/biome.json, ...
```

O git detectou automaticamente os renames (não foram recriações de arquivo).

---

## Estrutura do Repositório

```
project-manager/                  ← raiz do monorepo
  backend/                        ← projeto NestJS (este projeto)
    src/
    prisma/
    package.json
    ...
  frontend/                       ← (a ser criado)
  docs/
    specs/                        ← specs de design (este diretório)
    plans/                        ← planos de implementação
  docker-compose.yml              ← infraestrutura compartilhada (Postgres)
  client.http                     ← exemplos de chamadas à API
```

---

## Decisões

- `docker-compose.yml` em `backend/` por decisão do usuário (infraestrutura específica do backend neste momento)
- `docs/` na raiz para centralizar documentação independente de qual projeto a gerou
- `client.http` na raiz para fácil acesso por qualquer desenvolvedor
- Cada projeto futuro terá seu próprio `package.json` e `node_modules` isolados
