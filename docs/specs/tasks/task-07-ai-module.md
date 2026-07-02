# Task 07 — AI Analysis Module

## Context
Requires Task 03 (entity) and Task 04 (repository). The AI module is isolated from HTTP concerns — no controller imports here. All field names are English (matching the domain).

## Files
- Create: `src/projects/ai/ai.client.ts`
- Create: `src/projects/ai/anthropic-ai.client.ts`
- Create: `src/projects/ai/prompt-builder.ts`
- Create: `src/projects/ai/ai-analysis.service.ts`
- Create: `src/projects/use-cases/get-ai-analysis.use-case.ts`

## Produces
- `AiAnalysisInput` interface: `{ name, description, status, risk, budget, startDate, endDate }`
- `AiAnalysisResult` interface: `{ summary: string, attentionPoints: string[], executiveRecommendation: string }`
- `IAiClient` abstract class (NestJS DI token)
- `AnthropicAiClient` — real implementation using `@anthropic-ai/sdk`, model `claude-haiku-4-5-20251001`
- `ProjectAnalysisPromptBuilder` — builds the LLM prompt
- `AiAnalysisService` — orchestrates client + builder (no direct LLM call here)
- `GetAiAnalysisUseCase` — fetches project and delegates to `AiAnalysisService`

## Note on API key
`AnthropicAiClient` reads `process.env.ANTHROPIC_API_KEY`. If key is absent the endpoint will throw a runtime error — that is acceptable per spec (documented in README limitations).

---

- [ ] **Step 1: Create IAiClient abstract class and types**

```typescript
// src/projects/ai/ai.client.ts
export interface AiAnalysisInput {
  name: string;
  description: string;
  status: string;
  risk: string;
  budget: number;
  startDate: Date;
  endDate: Date;
}

export interface AiAnalysisResult {
  summary: string;
  attentionPoints: string[];
  executiveRecommendation: string;
}

export abstract class IAiClient {
  abstract analyze(input: AiAnalysisInput): Promise<AiAnalysisResult>;
}
```

- [ ] **Step 2: Create ProjectAnalysisPromptBuilder**

```typescript
// src/projects/ai/prompt-builder.ts
import { Injectable } from "@nestjs/common";
import { AiAnalysisInput } from "./ai.client";

@Injectable()
export class ProjectAnalysisPromptBuilder {
  build(input: AiAnalysisInput): string {
    const durationDays = Math.ceil(
      (input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return `You are a senior project management analyst. Analyze the following project and return a valid JSON object with exactly these keys: "summary" (string), "attentionPoints" (array of strings), and "executiveRecommendation" (string). Write all content in Brazilian Portuguese.

Project data:
- Name: ${input.name}
- Description: ${input.description}
- Current status: ${input.status}
- Risk level: ${input.risk}
- Total budget: R$ ${input.budget.toLocaleString("pt-BR")}
- Duration: ${durationDays} days (${input.startDate.toLocaleDateString("pt-BR")} to ${input.endDate.toLocaleDateString("pt-BR")})

Return ONLY the JSON object, no markdown fences, no extra text.`;
  }
}
```

- [ ] **Step 3: Create AnthropicAiClient**

```typescript
// src/projects/ai/anthropic-ai.client.ts
import { Injectable, Logger } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";
import { IAiClient, AiAnalysisInput, AiAnalysisResult } from "./ai.client";
import { ProjectAnalysisPromptBuilder } from "./prompt-builder";

@Injectable()
export class AnthropicAiClient extends IAiClient {
  private readonly client: Anthropic;
  private readonly logger = new Logger(AnthropicAiClient.name);

  constructor(private readonly promptBuilder: ProjectAnalysisPromptBuilder) {
    super();
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async analyze(input: AiAnalysisInput): Promise<AiAnalysisResult> {
    const prompt = this.promptBuilder.build(input);

    const message = await this.client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected AI response type");
    }

    try {
      return JSON.parse(content.text) as AiAnalysisResult;
    } catch {
      this.logger.error("Failed to parse AI response", content.text);
      throw new Error("Failed to process AI response");
    }
  }
}
```

- [ ] **Step 4: Create AiAnalysisService**

```typescript
// src/projects/ai/ai-analysis.service.ts
import { Injectable } from "@nestjs/common";
import { IAiClient, AiAnalysisInput, AiAnalysisResult } from "./ai.client";

@Injectable()
export class AiAnalysisService {
  constructor(private readonly aiClient: IAiClient) {}

  async analyze(input: AiAnalysisInput): Promise<AiAnalysisResult> {
    return this.aiClient.analyze(input);
  }
}
```

- [ ] **Step 5: Create GetAiAnalysisUseCase**

Note: maps English entity fields to `AiAnalysisInput` (also English).

```typescript
// src/projects/use-cases/get-ai-analysis.use-case.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { AiAnalysisResult } from "../ai/ai.client";
import { AiAnalysisService } from "../ai/ai-analysis.service";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class GetAiAnalysisUseCase {
  constructor(
    private readonly projectsRepository: IProjectsRepository,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  async execute(id: string): Promise<AiAnalysisResult> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException("Project not found");

    return this.aiAnalysisService.analyze({
      name: project.name,
      description: project.description,
      status: project.status,
      risk: project.risk,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
    });
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/projects/ai/ src/projects/use-cases/get-ai-analysis.use-case.ts
git commit -m "feat: add AI analysis module with Anthropic client, prompt builder and service"
```
