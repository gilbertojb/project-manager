# Task 01 — Project Bootstrap: NestJS + Biome + Zod

## Context
First task of the backend implementation. Creates the project skeleton before any domain code is written.

## Global Constraints (apply to all tasks)
- TypeScript strict mode everywhere — no `any`, no implicit returns
- Biome replaces ESLint + Prettier — do NOT install either
- Zod for environment variable validation and as the base for DTOs via `ZodValidationPipe`
- Domain model uses English field names; HTTP layer (DTOs, presenter) uses Portuguese field names
- Every project is created with status `analysis`; risk recalculated on `budget`, `startDate`, `endDate` changes
- Projects with status `in_progress` or `closed` cannot be deleted
- Valid status transitions: `analysis → approved → in_progress → closed`; any → `cancelled`
- API keys must never be committed — `.env` only

## Files
- Create: `backend/` (full NestJS scaffold)
- Create: `backend/biome.json`
- Create: `backend/vitest.config.ts`
- Create: `backend/src/env.ts`
- Create: `backend/.env.example`
- Modify: `backend/src/main.ts`

## Produces
- Runnable NestJS app on port 3000
- `validateEnv()` for typed env access
- Swagger UI at `/docs`

---

- [ ] **Step 1: Scaffold NestJS project**

```bash
cd /Users/gilbertobueno/Projects/codegroup
npx @nestjs/cli@latest new backend --package-manager npm --skip-git --language typescript
cd backend
```

- [ ] **Step 2: Remove ESLint/Prettier, install Biome**

```bash
npm uninstall eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-prettier
npm install --save-dev @biomejs/biome
npx biome init
```

- [ ] **Step 3: Configure biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedVariables": "error" },
      "style": { "noNonNullAssertion": "off" }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": { "quoteStyle": "double", "trailingCommas": "all" }
  },
  "files": {
    "ignore": ["node_modules", "dist"]
  }
}
```

- [ ] **Step 4: Install project dependencies**

```bash
npm install @nestjs/swagger zod @anthropic-ai/sdk
npm install --save-dev vitest @vitest/coverage-v8
```

- [ ] **Step 5: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 6: Create src/env.ts**

```typescript
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  ANTHROPIC_API_KEY: z.string().optional(),
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

- [ ] **Step 7: Create .env.example**

```
PORT=3000
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 8: Update src/main.ts**

```typescript
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("Project Manager API")
    .setDescription("REST API for project management with AI-powered analysis")
    .setVersion("1.0")
    .build();

  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

bootstrap();
```

- [ ] **Step 9: Add scripts to package.json**

Add to the `scripts` block:

```json
"lint": "biome lint ./src",
"format": "biome format --write ./src",
"test:unit": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 10: Verify the app starts**

```bash
npm run start:dev
```

Expected: `Application running on port 3000` with no errors.

- [ ] **Step 11: Commit**

```bash
git init
git add .
git commit -m "chore: bootstrap NestJS project with Biome, Zod and Swagger"
```
