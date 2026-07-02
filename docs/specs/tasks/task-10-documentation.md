# Task 10 — Documentation: README + AI_USAGE.md

## Context
Final task. Requires all other tasks complete. No code changes — documentation only.

## Files
- Create: `backend/README.md`
- Create: `backend/AI_USAGE.md`

---

- [ ] **Step 1: Create README.md**

```markdown
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
- npm 10+

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Running

```bash
# Development
npm run start:dev

# Production
npm run build && npm run start:prod
```

## Tests

```bash
npm run test:unit
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
```

- [ ] **Step 2: Create AI_USAGE.md**

```markdown
# AI Usage Documentation

## Tool Used

**Claude Code** (claude-sonnet-4-6) — Anthropic's CLI for AI-assisted development.
**Anthropic API** (claude-haiku-4-5-20251001) — Used at runtime for project analysis.

## How AI Was Used in Development

### Planning and Architecture
- Generated the full implementation plan with TDD approach
- Helped decide on simplified Clean Architecture folder structure
- Defined interfaces between layers

### Implementation
- Generated boilerplate for entity, use-cases, repository and controller
- All generated code was reviewed and adjusted before committing

### Runtime AI Feature (analysis endpoint)
The `GET /projects/:id/ai-analysis` endpoint calls the Anthropic API (Haiku model) to generate a textual analysis.

**Main prompt template:**
```
You are a senior project management analyst. Analyze the following project and return a valid JSON object with exactly these keys: "summary" (string), "attentionPoints" (array of strings), and "executiveRecommendation" (string). Write all content in Brazilian Portuguese.

[project data]

Return ONLY the JSON object, no markdown fences, no extra text.
```

## What Was Accepted, Adjusted, or Discarded

- **Accepted:** module structure, interfaces, test cases
- **Adjusted:** risk calculation logic — the "highest risk wins" rule required fine-tuning; domain model migrated to English names while HTTP API kept Portuguese
- **Discarded:** Either/Result monad pattern — unnecessary complexity for this scope

## Developer's Technical Decisions

1. **In-memory over database** — keeps setup simple without compromising architectural clarity; swapping to Prisma/PostgreSQL only requires implementing `IProjectsRepository`
2. **Biome over ESLint+Prettier** — faster, unified tooling with a single config file
3. **Zod over class-validator** — runtime type safety without verbose decorators
4. **Portuguese API / English domain** — HTTP interface keeps Brazilian field names for frontend compatibility; domain model uses English for code clarity
5. **Claude Haiku for analysis** — faster and cheaper than Sonnet for this structured task

## Limitations

- Data does not persist between server restarts (in-memory store)
- No pagination on the project list endpoint
- AI analysis requires `ANTHROPIC_API_KEY` to be configured
- No authentication or authorization layer
```

- [ ] **Step 3: Final commit**

```bash
git add README.md AI_USAGE.md
git commit -m "docs: add README with setup instructions and AI_USAGE documentation"
```
