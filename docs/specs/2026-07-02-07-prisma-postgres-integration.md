# Design: Prisma + PostgreSQL Integration

**Date:** 2026-07-02
**Status:** Approved

---

## Objetivo

Substituir o repositório in-memory por persistência real usando Prisma ORM + PostgreSQL, sem alterar use-cases, domínio ou regras de negócio existentes.

---

## Arquitetura

O projeto já segue Clean Architecture com `IProjectsRepository` como contrato. A troca de implementação exige apenas:

1. Novo `PrismaService` como singleton NestJS (gerencia conexão/desconexão)
2. Novo `PrismaProjectsRepository` implementando `IProjectsRepository`
3. Atualização do `ProjectsModule` para prover `PrismaProjectsRepository` em vez de `InMemoryProjectsRepository`

`InMemoryProjectsRepository` permanece inalterado para uso exclusivo nos testes de use-cases.

---

## Componentes

### `PrismaService` (`src/shared/prisma/prisma.service.ts`)
- Estende `PrismaClient`
- Implementa `OnModuleInit` / `OnModuleDestroy` do NestJS para `$connect` e `$disconnect`
- Exportado por um `PrismaModule` global ou importado diretamente em `ProjectsModule`

### `PrismaProjectsRepository` (`src/projects/persistence/prisma-projects.repository.ts`)
- Implementa `IProjectsRepository`
- Injeta `PrismaService`
- Mapeia `Prisma.Project` (snake_case) ↔ `ProjectData` do domínio via função `toDomain()`
- `risk` é lido do banco (nunca recalculado pelo repositório — a entidade é responsável)

### Schema Prisma (`prisma/schema.prisma`)
- Provider: `postgresql`
- `DATABASE_URL` via env
- Model `Project` com todos os campos do domínio em snake_case

### Tabela `projects`

| Coluna | Tipo Prisma | Notas |
|--------|-------------|-------|
| id | String @id @default(uuid()) | UUID gerado no domínio |
| name | String | |
| start_date | DateTime | |
| end_date | DateTime | |
| budget | Float | |
| description | String | |
| status | String | values: analysis, approved, in_progress, closed, cancelled |
| risk | String | values: low, medium, high — sempre sincronizado pela entidade |
| created_at | DateTime @default(now()) | |
| updated_at | DateTime @updatedAt | |

---

## Infraestrutura

### `docker-compose.yml` (raiz do repositório)
- Serviço `postgres` com imagem `postgres:16-alpine`
- Porta `5432:5432`
- Volume nomeado para persistência
- Variáveis: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

### `.env` (backend)
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_manager`

---

## Seed (`prisma/seed.ts`)
- Script TypeScript executado via `ts-node`
- Cria ~5 projetos cobrindo diferentes status e níveis de risco
- Registrado em `package.json` como `prisma.seed`
- Usa `prisma.$transaction` para inserção atômica

---

## `client.http` (raiz do repositório)
Arquivo com todas as rotas disponíveis na API:

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /projects | Criar projeto |
| GET | /projects | Listar projetos |
| GET | /projects/:id | Buscar por ID |
| PATCH | /projects/:id | Atualizar campos |
| DELETE | /projects/:id | Deletar projeto |
| PATCH | /projects/:id/status | Avançar status |
| GET | /projects/:id/ai-analysis | Análise de IA |

---

## Regras preservadas

- `risk` nunca é calculado fora da entidade
- Transições de status seguem a sequência definida em `STATUS_TRANSITIONS`
- Projetos com status `in_progress` ou `closed` não podem ser deletados
- Use-cases não sofrem nenhuma alteração
- Testes de use-cases continuam usando `InMemoryProjectsRepository`

---

## Comandos adicionados ao `package.json`

```json
"db:migrate": "prisma migrate dev",
"db:generate": "prisma generate",
"db:seed": "prisma db seed",
"db:studio": "prisma studio"
```
