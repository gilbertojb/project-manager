# Backend — Agent Rules

## Stack
- Node.js 20 + NestJS 10 + TypeScript (strict)
- Biome for lint and formatting (no ESLint, no Prettier)
- Zod for env and DTO validation
- Vitest for unit tests
- Anthropic SDK for AI integration
- Swagger (@nestjs/swagger) for API documentation

## Architecture
Clean Architecture in 3 layers inside `src/projects/`:
1. `domain/` — Project entity and types (zero framework dependency; English field names)
2. `use-cases/` — Pure business logic, depends only on interfaces
3. `http/` + `persistence/` — Infrastructure details (NestJS, in-memory store)

HTTP layer uses Portuguese field names (DTOs and presenter responses).
Controller maps Portuguese DTO fields to English domain props and vice-versa.

AI module lives in `src/projects/ai/` with:
- `IAiClient` (interface) → `AnthropicAiClient` (implementation)
- `ProjectAnalysisPromptBuilder` (builds the prompt)
- `AiAnalysisService` (orchestrates the two above)

## Hard Rules
- Never put business logic in the controller
- Never commit API keys — use `.env`
- Risk is always recalculated inside the entity, never manually in a use-case
- Status follows strict sequence: analysis → approved → in_progress → closed (any → cancelled)
- Projects with status `in_progress` or `closed` cannot be deleted
- Domain model: English names. HTTP API: Portuguese names.

## Commands
- Start dev: `pnpm run start:dev`
- Run tests: `pnpm run test:unit`
- Lint: `pnpm run lint`
- Format: `pnpm run format`
- Build: `pnpm run build`
