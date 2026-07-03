# Spec 01 — Bootstrap & Stack Setup

**Data:** 2026-07-02
**Commits:** 455fa0a → 78a76ec
**Status:** Implementado

---

## Objetivo

Criar a base do projeto backend com todas as ferramentas de desenvolvimento configuradas e prontas para uso, antes de qualquer lógica de negócio.

---

## Stack Definida

| Ferramenta | Versão | Papel |
|-----------|--------|-------|
| Node.js | 20 | Runtime |
| NestJS | 11 | Framework HTTP + DI |
| TypeScript | 5.7 (strict) | Linguagem — strict mode habilitado |
| pnpm | 10 | Gerenciador de pacotes |
| Biome | 2.x | Lint + format (substitui ESLint + Prettier) |
| Zod | 4 | Validação de env e DTOs |
| Vitest | 4 | Testes unitários (substitui Jest) |
| @nestjs/swagger | 11 | Documentação OpenAPI em `/docs` |

---

## Decisões de Arquitetura

**Por que Biome em vez de ESLint + Prettier?**
Ferramenta única para lint e formatação, configuração mínima, performance superior. Elimina conflitos de regras entre ESLint e Prettier.

**Por que Vitest em vez de Jest?**
Integração nativa com TypeScript sem transpilação separada, API compatível com Jest, modo watch mais rápido.

**Por que pnpm?**
Hoisting restrito, instalações mais rápidas, workspace nativo para monorepo futuro.

**TypeScript strict mode:**
Habilita `strictNullChecks`, `noImplicitAny` e demais verificações rigorosas. Garante que erros de tipo sejam detectados em tempo de compilação.

---

## Estrutura Inicial

```
backend/
  src/
    main.ts           — bootstrap NestJS, Swagger setup, env validation
    app.module.ts     — módulo raiz
    env.ts            — schema Zod para variáveis de ambiente
  biome.json          — regras de lint e format
  nest-cli.json       — configuração do CLI NestJS
  tsconfig.json       — TypeScript strict
  vitest.config.ts    — configuração do Vitest
  package.json        — scripts: start:dev, build, test:unit, lint, format
```

---

## Scripts Disponíveis

```bash
pnpm run start:dev    # servidor com watch
pnpm run build        # compilação TypeScript
pnpm run test:unit    # testes unitários (vitest run)
pnpm run lint         # biome lint ./src
pnpm run format       # biome format --write ./src
```

---

## Variáveis de Ambiente (env.ts)

```
PORT=3000                    # opcional, default 3000
ANTHROPIC_API_KEY=sk-ant-... # opcional na inicialização
DATABASE_URL=postgresql://...# obrigatório (adicionado em 07)
```

Validadas via Zod em `validateEnv()`, chamada no `bootstrap()` de `main.ts` antes de qualquer serviço subir.
