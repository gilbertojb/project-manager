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
