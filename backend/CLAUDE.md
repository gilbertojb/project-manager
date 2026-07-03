# Backend — Regras do Agente

## Stack

- Node.js 20 + NestJS 11 + TypeScript (strict)
- Biome para lint e formatação (sem ESLint, sem Prettier)
- Zod para validação de env e DTOs
- Vitest para testes unitários
- Prisma 7 + PostgreSQL para persistência
- Anthropic SDK para integração de IA
- Swagger (@nestjs/swagger) para documentação da API em `/docs`

## Arquitetura

Clean Architecture em 3 camadas dentro de `src/projects/`:

1. `domain/` — entidade `Project` e tipos (zero dependência de framework; nomes em inglês)
2. `use-cases/` — lógica de negócio pura, depende apenas de interfaces
3. `http/` + `persistence/` — detalhes de infraestrutura (NestJS, Prisma)

A camada HTTP usa nomes em português (DTOs e respostas do presenter).
O controller mapeia campos do DTO português → props do domínio inglês e vice-versa.

O módulo de IA está em `src/projects/ai/`:
- `IAiClient` (classe abstrata) → `AnthropicAiClient` (implementação)
- `ProjectAnalysisPromptBuilder` (constrói o prompt)
- `AiAnalysisService` (orquestra os dois acima)

A configuração do Prisma usa `prisma.config.ts` (Prisma 7 API) em vez de `url = env()` no schema.

## Regras Invioláveis

- Nunca colocar lógica de negócio no controller
- Nunca commitar API keys — usar `.env`
- `risk` é sempre recalculado dentro da entidade, nunca no use-case ou repositório
- Status segue sequência estrita: `analysis → approved → in_progress → closed` (qualquer → `cancelled`)
- Projetos com status `in_progress` ou `closed` não podem ser deletados
- Domínio: nomes em inglês. API HTTP: nomes em português
- `InMemoryProjectsRepository` é preservado — usado exclusivamente nos testes de use-cases

## Banco de Dados

### Subir o PostgreSQL

```bash
docker compose up -d
```

### Migration e seed

```bash
pnpm run db:migrate      # cria/aplica migrations
pnpm run db:seed         # insere 5 projetos de exemplo
pnpm run db:studio       # abre o Prisma Studio
```

### DATABASE_URL

```
postgresql://postgres:postgres@localhost:5432/project_manager
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```
PORT=3000
ANTHROPIC_API_KEY=sk-ant-...   # necessário para GET /projects/:id/ai-analysis
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_manager
```

## Comandos

```bash
pnpm run start:dev    # servidor com hot-reload
pnpm run build        # compilação TypeScript
pnpm run test:unit    # testes unitários (vitest run)
pnpm run lint         # biome lint ./src
pnpm run format       # biome format --write ./src
pnpm run db:migrate   # prisma migrate dev
pnpm run db:generate  # prisma generate
pnpm run db:seed      # prisma db seed
pnpm run db:studio    # prisma studio
```

## Testes

- Testes ficam no mesmo diretório do arquivo testado (`*.spec.ts`)
- Use `InMemoryProjectsRepository` como repositório real nos testes de use-cases (sem mocks)
- Rode `pnpm run test:unit` antes de commitar
- `PrismaProjectsRepository` não tem testes unitários — a cobertura de negócio vem dos testes de use-cases

## Estrutura de Arquivos

```
backend/
  prisma/
    schema.prisma           ← modelo Project + provider PostgreSQL
    prisma.config.ts        ← config Prisma 7 (DATABASE_URL, seed)
    seed.ts                 ← 5 projetos de exemplo
    migrations/             ← histórico de migrations
  src/
    main.ts                 ← bootstrap, Swagger, validateEnv
    app.module.ts           ← módulo raiz + HttpExceptionFilter global
    env.ts                  ← schema Zod para variáveis de ambiente
    projects/
      domain/               ← entidade, tipos, regras de negócio
      use-cases/            ← lógica de aplicação + specs
      repositories/         ← IProjectsRepository (contrato)
      persistence/          ← InMemoryProjectsRepository, PrismaProjectsRepository
      http/                 ← controller, DTOs, presenter
      ai/                   ← IAiClient, AnthropicAiClient, prompt builder
      projects.module.ts
    shared/
      filters/              ← HttpExceptionFilter
      pipes/                ← ZodValidationPipe
      prisma/               ← PrismaService, PrismaModule
```
