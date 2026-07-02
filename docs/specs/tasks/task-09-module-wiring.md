# Task 09 — ProjectsModule + AppModule + Exception Filter

## Context
Requires all previous tasks (01–08) complete. Wires together all providers via NestJS DI. Smoke tests the running API.

## Files
- Create: `src/shared/filters/http-exception.filter.ts`
- Create: `src/projects/projects.module.ts`
- Modify: `src/app.module.ts`

## Produces
- Global `HttpExceptionFilter` registered via `APP_FILTER`
- `ProjectsModule` with all use-cases, AI module, and controller declared
- Fully runnable API serving all 7 endpoints

---

- [ ] **Step 1: Create global HttpExceptionFilter**

```typescript
// src/shared/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    if (status >= 500) {
      this.logger.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === "object" ? message : { message }),
    });
  }
}
```

- [ ] **Step 2: Create ProjectsModule**

```typescript
// src/projects/projects.module.ts
import { Module } from "@nestjs/common";
import { IProjectsRepository } from "./repositories/projects.repository";
import { InMemoryProjectsRepository } from "./persistence/in-memory-projects.repository";
import { IAiClient } from "./ai/ai.client";
import { AnthropicAiClient } from "./ai/anthropic-ai.client";
import { ProjectAnalysisPromptBuilder } from "./ai/prompt-builder";
import { AiAnalysisService } from "./ai/ai-analysis.service";
import { CreateProjectUseCase } from "./use-cases/create-project.use-case";
import { ListProjectsUseCase } from "./use-cases/list-projects.use-case";
import { GetProjectUseCase } from "./use-cases/get-project.use-case";
import { UpdateProjectUseCase } from "./use-cases/update-project.use-case";
import { DeleteProjectUseCase } from "./use-cases/delete-project.use-case";
import { UpdateProjectStatusUseCase } from "./use-cases/update-project-status.use-case";
import { GetAiAnalysisUseCase } from "./use-cases/get-ai-analysis.use-case";
import { ProjectsController } from "./http/projects.controller";

@Module({
  controllers: [ProjectsController],
  providers: [
    { provide: IProjectsRepository, useClass: InMemoryProjectsRepository },
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

- [ ] **Step 3: Update AppModule**

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ProjectsModule } from "./projects/projects.module";
import { HttpExceptionFilter } from "./shared/filters/http-exception.filter";

@Module({
  imports: [ProjectsModule],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
```

- [ ] **Step 4: Smoke test all endpoints**

```bash
npm run start:dev
```

In a second terminal:

```bash
# Create a project
curl -s -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{"nome":"My Project","dataInicio":"2026-01-01","previsaoTermino":"2026-04-01","orcamentoTotal":50000,"descricao":"Test"}' | jq .
```

Expected: `{ "status": "analysis", "risco": "low", "nome": "My Project", ... }`

```bash
# List projects
curl -s http://localhost:3000/projects | jq .
```

Expected: array with 1 project

```bash
# Verify Swagger
open http://localhost:3000/docs
```

Expected: Swagger UI showing all 7 endpoints under `projects` tag.

- [ ] **Step 5: Run all unit tests**

```bash
npm run test:unit
```

Expected: PASS — all tests green

- [ ] **Step 6: Commit**

```bash
git add src/projects/projects.module.ts src/app.module.ts src/shared/filters/
git commit -m "feat: wire ProjectsModule with DI, global exception filter and Swagger"
```
