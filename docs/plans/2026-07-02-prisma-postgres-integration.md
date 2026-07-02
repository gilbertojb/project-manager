# Prisma + PostgreSQL Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o `InMemoryProjectsRepository` por `PrismaProjectsRepository` com PostgreSQL real, sem alterar use-cases, domínio ou testes existentes.

**Architecture:** `PrismaService` wrapa o `PrismaClient` como singleton NestJS. `PrismaProjectsRepository` implementa `IProjectsRepository` mapeando entre tipos do Prisma (snake_case) e `ProjectData` do domínio. `InMemoryProjectsRepository` permanece intacto para os testes de use-cases.

**Tech Stack:** Prisma ORM 6.x, `@prisma/client`, PostgreSQL 16 (Docker), pnpm, ts-node, NestJS 11.

## Global Constraints

- Nunca colocar lógica de negócio fora da entidade `Project`
- `risk` nunca é calculado no repositório — ler e gravar o valor que a entidade fornece
- `status` segue a sequência definida em `STATUS_TRANSITIONS` — o repositório não valida isso
- Comandos executados a partir do diretório `backend/` salvo indicação contrária
- Nunca commitar `.env` — apenas `.env.example`

---

## Task 1: docker-compose + Prisma install + schema + primeira migration

**Files:**
- Create: `docker-compose.yml` (raiz do repositório)
- Create: `backend/prisma/schema.prisma`
- Modify: `backend/.env.example`
- Create: `backend/.env` (não versionado)
- Modify: `backend/package.json`
- Modify: `backend/src/env.ts`

**Interfaces:**
- Produces: banco `project_manager` rodando em `localhost:5432`; tabela `projects` criada via migration; `@prisma/client` gerado

---

- [ ] **Step 1: Criar `docker-compose.yml` na raiz do repositório**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: project_manager
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

- [ ] **Step 2: Subir o container**

```bash
# na raiz do repositório
docker compose up -d
```

Aguardar ~5 segundos e verificar:
```bash
docker compose ps
```
Esperado: serviço `postgres` com status `running`.

- [ ] **Step 3: Atualizar `backend/.env.example`**

```
PORT=3000
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_manager
```

- [ ] **Step 4: Criar `backend/.env`**

```
PORT=3000
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_manager
```

- [ ] **Step 5: Adicionar `DATABASE_URL` à validação de env em `backend/src/env.ts`**

```typescript
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  ANTHROPIC_API_KEY: z.string().optional(),
  DATABASE_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.error.message}`);
  }
  return result.data;
}
```

- [ ] **Step 6: Instalar dependências do Prisma**

```bash
cd backend
pnpm add @prisma/client
pnpm add -D prisma
```

- [ ] **Step 7: Adicionar scripts e config do seed em `backend/package.json`**

Dentro do objeto raiz do `package.json`, adicionar ao lado de `"scripts"`:
```json
"prisma": {
  "seed": "ts-node --transpile-only -r tsconfig-paths/register prisma/seed.ts"
},
```

E dentro de `"scripts"` existente, adicionar:
```json
"db:migrate": "prisma migrate dev",
"db:generate": "prisma generate",
"db:seed": "prisma db seed",
"db:studio": "prisma studio"
```

- [ ] **Step 8: Criar `backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id          String   @id
  name        String
  start_date  DateTime
  end_date    DateTime
  budget      Float
  description String
  status      String
  risk        String
  created_at  DateTime
  updated_at  DateTime

  @@map("projects")
}
```

- [ ] **Step 9: Rodar a primeira migration**

```bash
cd backend
pnpm run db:migrate --name init
```

Esperado: output `Your database is now in sync with your schema.` e geração automática do `@prisma/client`.

- [ ] **Step 10: Verificar que a tabela foi criada**

```bash
docker exec -it $(docker compose ps -q postgres) psql -U postgres -d project_manager -c "\dt"
```

Esperado: listagem com a tabela `projects`.

- [ ] **Step 11: Commit**

```bash
# na raiz do repositório
git add docker-compose.yml backend/prisma backend/src/env.ts backend/.env.example backend/package.json backend/pnpm-lock.yaml
git commit -m "feat: add Prisma + PostgreSQL with docker-compose and initial migration"
```

---

## Task 2: PrismaService + PrismaModule

**Files:**
- Create: `backend/src/shared/prisma/prisma.service.ts`
- Create: `backend/src/shared/prisma/prisma.module.ts`

**Interfaces:**
- Produces: `PrismaService` — estende `PrismaClient`, exportado por `PrismaModule`. Injetável em qualquer módulo que importe `PrismaModule`.

---

- [ ] **Step 1: Criar `backend/src/shared/prisma/prisma.service.ts`**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

- [ ] **Step 2: Criar `backend/src/shared/prisma/prisma.module.ts`**

```typescript
import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3: Verificar que o build compila sem erros**

```bash
cd backend
pnpm run build
```

Esperado: sem erros de TypeScript.

- [ ] **Step 4: Commit**

```bash
git add backend/src/shared/prisma/
git commit -m "feat: add PrismaService and PrismaModule"
```

---

## Task 3: PrismaProjectsRepository

**Files:**
- Create: `backend/src/projects/persistence/prisma-projects.repository.ts`

**Interfaces:**
- Consumes: `PrismaService` (de Task 2); `Project` entity e `ProjectData` de `domain/project.entity.ts`; `ProjectStatus`, `ProjectRisk` de `domain/project.types.ts`; `IProjectsRepository` de `repositories/projects.repository.ts`
- Produces: `PrismaProjectsRepository` — classe `@Injectable()` que estende `IProjectsRepository` e implementa os 5 métodos: `findAll`, `findById`, `create`, `update`, `delete`

---

- [ ] **Step 1: Criar `backend/src/projects/persistence/prisma-projects.repository.ts`**

```typescript
import { Injectable } from "@nestjs/common";
import type { Project as PrismaProject } from "@prisma/client";
import { Project } from "../domain/project.entity";
import { ProjectStatus, ProjectRisk } from "../domain/project.types";
import { IProjectsRepository } from "../repositories/projects.repository";
import { PrismaService } from "../../shared/prisma/prisma.service";

function toDomain(raw: PrismaProject): Project {
  return Project.restore({
    id: raw.id,
    name: raw.name,
    startDate: raw.start_date,
    endDate: raw.end_date,
    budget: raw.budget,
    description: raw.description,
    status: raw.status as ProjectStatus,
    risk: raw.risk as ProjectRisk,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  });
}

function toRow(project: Project) {
  return {
    id: project.id,
    name: project.name,
    start_date: project.startDate,
    end_date: project.endDate,
    budget: project.budget,
    description: project.description,
    status: project.status as string,
    risk: project.risk as string,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

@Injectable()
export class PrismaProjectsRepository extends IProjectsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<Project[]> {
    const rows = await this.prisma.project.findMany();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async create(project: Project): Promise<void> {
    await this.prisma.project.create({ data: toRow(project) });
  }

  async update(project: Project): Promise<void> {
    await this.prisma.project.update({ where: { id: project.id }, data: toRow(project) });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }
}
```

- [ ] **Step 2: Verificar que o build compila sem erros**

```bash
cd backend
pnpm run build
```

Esperado: sem erros de TypeScript.

- [ ] **Step 3: Commit**

```bash
git add backend/src/projects/persistence/prisma-projects.repository.ts
git commit -m "feat: add PrismaProjectsRepository"
```

---

## Task 4: Wire PrismaProjectsRepository no ProjectsModule

**Files:**
- Modify: `backend/src/projects/projects.module.ts`

**Interfaces:**
- Consumes: `PrismaModule` (Task 2); `PrismaProjectsRepository` (Task 3)
- Produces: `ProjectsModule` atualizado — usa `PrismaProjectsRepository` como implementação de `IProjectsRepository` em produção. `InMemoryProjectsRepository` não é mais registrado no módulo (permanece no arquivo para os testes).

---

- [ ] **Step 1: Atualizar `backend/src/projects/projects.module.ts`**

```typescript
import { Module } from "@nestjs/common";
import { IProjectsRepository } from "./repositories/projects.repository";
import { PrismaProjectsRepository } from "./persistence/prisma-projects.repository";
import { PrismaModule } from "../shared/prisma/prisma.module";
import { IAiClient } from "./ai/ai.client";
import { AnthropicAiClient } from "./ai/anthropic-ai.client";
import { AiAnalysisService } from "./ai/ai-analysis.service";
import { ProjectAnalysisPromptBuilder } from "./ai/prompt-builder";
import { CreateProjectUseCase } from "./use-cases/create-project.use-case";
import { ListProjectsUseCase } from "./use-cases/list-projects.use-case";
import { GetProjectUseCase } from "./use-cases/get-project.use-case";
import { UpdateProjectUseCase } from "./use-cases/update-project.use-case";
import { DeleteProjectUseCase } from "./use-cases/delete-project.use-case";
import { UpdateProjectStatusUseCase } from "./use-cases/update-project-status.use-case";
import { GetAiAnalysisUseCase } from "./use-cases/get-ai-analysis.use-case";
import { ProjectsController } from "./http/projects.controller";

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [
    { provide: IProjectsRepository, useClass: PrismaProjectsRepository },
    { provide: IAiClient, useClass: AnthropicAiClient },
    ProjectAnalysisPromptBuilder,
    AiAnalysisService,
    CreateProjectUseCase,
    ListProjectsUseCase,
    GetProjectUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
    UpdateProjectStatusUseCase,
    GetAiAnalysisUseCase,
  ],
})
export class ProjectsModule {}
```

- [ ] **Step 2: Verificar que os testes de use-cases ainda passam (eles usam InMemoryProjectsRepository)**

```bash
cd backend
pnpm run test:unit
```

Esperado: todos os testes passam.

- [ ] **Step 3: Verificar que o app sobe corretamente**

```bash
cd backend
pnpm run start:dev
```

Esperado: log `Application running on port 3000` sem erros de conexão com o banco.

Encerrar com `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/projects/projects.module.ts
git commit -m "feat: wire PrismaProjectsRepository into ProjectsModule"
```

---

## Task 5: Seed

**Files:**
- Create: `backend/prisma/seed.ts`

**Interfaces:**
- Consumes: `@prisma/client` gerado (Task 1); `Project` entity; `ProjectStatus` enum
- Produces: script que apaga todos os projetos e insere 5 novos com statuses e riscos variados

---

- [ ] **Step 1: Criar `backend/prisma/seed.ts`**

```typescript
import { PrismaClient } from "@prisma/client";
import { Project } from "../src/projects/domain/project.entity";
import { ProjectStatus } from "../src/projects/domain/project.types";

const prisma = new PrismaClient();

function toRow(project: Project) {
  return {
    id: project.id,
    name: project.name,
    start_date: project.startDate,
    end_date: project.endDate,
    budget: project.budget,
    description: project.description,
    status: project.status as string,
    risk: project.risk as string,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

async function main() {
  // LOW risk, status: analysis
  const p1 = Project.create({
    name: "Landing Page Institucional",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2026-09-30"),
    budget: 30000,
    description: "Criação de landing page institucional para divulgação da marca.",
  });

  // MEDIUM risk, status: approved
  const p2 = Project.create({
    name: "Integração com CRM",
    startDate: new Date("2026-07-01"),
    endDate: new Date("2026-10-31"),
    budget: 95000,
    description: "Integração do sistema atual com CRM via API REST.",
  });
  p2.transitionTo(ProjectStatus.APPROVED);

  // HIGH risk, status: in_progress
  const p3 = Project.create({
    name: "Sistema de Gestão Financeira",
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-12-15"),
    budget: 750000,
    description: "Sistema integrado de gestão financeira e contabilidade.",
  });
  p3.transitionTo(ProjectStatus.APPROVED);
  p3.transitionTo(ProjectStatus.IN_PROGRESS);

  // HIGH risk, status: closed
  const p4 = Project.create({
    name: "Plataforma de E-commerce",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-10-31"),
    budget: 600000,
    description: "Plataforma de e-commerce B2C com gateway de pagamento integrado.",
  });
  p4.transitionTo(ProjectStatus.APPROVED);
  p4.transitionTo(ProjectStatus.IN_PROGRESS);
  p4.transitionTo(ProjectStatus.CLOSED);

  // MEDIUM risk, status: cancelled
  const p5 = Project.create({
    name: "App Mobile de Vendas",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-09-30"),
    budget: 180000,
    description: "Aplicativo mobile para equipe de vendas com catálogo e pedidos.",
  });
  p5.transitionTo(ProjectStatus.CANCELLED);

  await prisma.$transaction([
    prisma.project.deleteMany(),
    ...([p1, p2, p3, p4, p5].map((p) => prisma.project.create({ data: toRow(p) }))),
  ]);

  console.log("Seed concluído: 5 projetos inseridos.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Rodar o seed**

```bash
cd backend
pnpm run db:seed
```

Esperado: `Seed concluído: 5 projetos inseridos.`

- [ ] **Step 3: Verificar os dados no banco**

```bash
docker exec -it $(docker compose ps -q postgres) psql -U postgres -d project_manager -c "SELECT name, status, risk FROM projects;"
```

Esperado: 5 linhas com nomes, statuses e riscos variados.

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/seed.ts
git commit -m "feat: add database seed with 5 sample projects"
```

---

## Task 6: client.http

**Files:**
- Create: `client.http` (raiz do repositório)

**Interfaces:**
- Produces: arquivo com todas as 7 rotas da API documentadas com exemplos funcionais. Compatível com a extensão REST Client do VSCode e com o IntelliJ HTTP Client.

---

- [ ] **Step 1: Criar `client.http` na raiz do repositório**

```http
@baseUrl = http://localhost:3000
@projectId = SUBSTITUA_PELO_ID_REAL

### Criar projeto (risco LOW, curta duração e orçamento baixo)
POST {{baseUrl}}/projects
Content-Type: application/json

{
  "nome": "Portal do Colaborador",
  "dataInicio": "2026-08-01",
  "previsaoTermino": "2026-09-15",
  "orcamentoTotal": 25000,
  "descricao": "Portal interno para gestão de benefícios e ponto eletrônico."
}

###

### Criar projeto (risco HIGH, longa duração e alto orçamento)
POST {{baseUrl}}/projects
Content-Type: application/json

{
  "nome": "ERP Corporativo",
  "dataInicio": "2026-07-01",
  "previsaoTermino": "2027-06-30",
  "orcamentoTotal": 900000,
  "descricao": "Implantação de ERP corporativo com módulos financeiro, RH e logística."
}

###

### Listar todos os projetos
GET {{baseUrl}}/projects

###

### Buscar projeto por ID
GET {{baseUrl}}/projects/{{projectId}}

###

### Atualizar campos do projeto
PATCH {{baseUrl}}/projects/{{projectId}}
Content-Type: application/json

{
  "nome": "Portal do Colaborador v2",
  "orcamentoTotal": 35000
}

###

### Avançar status: analysis → approved
PATCH {{baseUrl}}/projects/{{projectId}}/status
Content-Type: application/json

{
  "status": "approved"
}

###

### Avançar status: approved → in_progress
PATCH {{baseUrl}}/projects/{{projectId}}/status
Content-Type: application/json

{
  "status": "in_progress"
}

###

### Avançar status: in_progress → closed
PATCH {{baseUrl}}/projects/{{projectId}}/status
Content-Type: application/json

{
  "status": "closed"
}

###

### Cancelar projeto (qualquer status exceto closed)
PATCH {{baseUrl}}/projects/{{projectId}}/status
Content-Type: application/json

{
  "status": "cancelled"
}

###

### Deletar projeto (só funciona em status analysis ou approved)
DELETE {{baseUrl}}/projects/{{projectId}}

###

### Obter análise de IA do projeto
GET {{baseUrl}}/projects/{{projectId}}/ai-analysis
```

- [ ] **Step 2: Commit**

```bash
# na raiz do repositório
git add client.http
git commit -m "feat: add client.http with all API routes"
```
