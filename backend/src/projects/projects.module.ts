import { Module } from "@nestjs/common";
import { IProjectsRepository } from "./repositories/projects.repository";
import { PrismaProjectsRepository } from "./persistence/prisma-projects.repository";
import { PrismaModule } from "../shared/prisma/prisma.module";
import { IAiClient } from "./ai/ai.client";
import { AnthropicAiClient } from "./ai/anthropic-ai.client";
import { GeminiAiClient } from "./ai/gemini-ai.client";
import { OpenAiClient } from "./ai/openai-ai.client";
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
    ProjectAnalysisPromptBuilder,
    {
      provide: IAiClient,
      useFactory: (promptBuilder: ProjectAnalysisPromptBuilder) => {
        const provider = process.env.AI_PROVIDER ?? "anthropic";
        if (provider === "gemini") return new GeminiAiClient(promptBuilder);
        if (provider === "openai") return new OpenAiClient(promptBuilder);
        return new AnthropicAiClient(promptBuilder);
      },
      inject: [ProjectAnalysisPromptBuilder],
    },
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
