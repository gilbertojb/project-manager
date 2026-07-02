# Project Manager API

REST API for simplified project management with automatic risk calculation and AI-powered textual analysis.

## Stack

- Node.js 20 + NestJS 10 + TypeScript (strict)
- Biome (lint and formatting)
- Zod (validation)
- Vitest (unit tests)
- Anthropic Claude (AI analysis)
- Swagger / OpenAPI

## Requirements

- Node.js 20+
- pnpm 10+

## Setup

```bash
pnpm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Running

```bash
# Development
pnpm run start:dev

# Production
pnpm run build && pnpm run start:prod
```

## Tests

```bash
pnpm run test:unit
```

## API Documentation

With the server running, visit: `http://localhost:3000/docs`

## Endpoints

| Method | Route                     | Description       |
|--------|---------------------------|-------------------|
| POST   | /projects                 | Create project    |
| GET    | /projects                 | List all projects |
| GET    | /projects/:id             | Get project by ID |
| PATCH  | /projects/:id             | Update project    |
| DELETE | /projects/:id             | Delete project    |
| PATCH  | /projects/:id/status      | Change status     |
| GET    | /projects/:id/ai-analysis | AI analysis       |

## Request/Response Fields

The API uses Portuguese field names:

| Field | Type | Description |
|-------|------|-------------|
| nome | string | Project name |
| dataInicio | ISO date | Start date |
| previsaoTermino | ISO date | Expected end date |
| orcamentoTotal | number | Total budget (BRL) |
| descricao | string | Description |
| status | string | `analysis`, `approved`, `in_progress`, `closed`, `cancelled` |
| risco | string | `low`, `medium`, `high` |

## Environment Variables

| Variable          | Description       | Default |
|-------------------|-------------------|---------|
| PORT              | Server port       | 3000    |
| ANTHROPIC_API_KEY | Anthropic API key | —       |

## Architecture

Clean Architecture with 3 layers inside `src/projects/`:

1. **domain/** — Project entity and business rules (English field names, zero framework dependency)
2. **use-cases/** — Business logic, depends only on interfaces
3. **http/** + **persistence/** — Infrastructure (NestJS controller with PT↔EN mapping, in-memory store)
