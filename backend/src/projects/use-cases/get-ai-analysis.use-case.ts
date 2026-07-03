import { Injectable, NotFoundException } from "@nestjs/common";
import type { AiAnalysisResult } from "@/projects/ai/ai.client";
import { AiAnalysisService } from "@/projects/ai/ai-analysis.service";
import { IProjectsRepository } from "@/projects/repositories/projects.repository";

@Injectable()
export class GetAiAnalysisUseCase {
  constructor(
    private readonly projectsRepository: IProjectsRepository,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  async execute(id: string): Promise<AiAnalysisResult> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException("Project not found");

    const result = await this.aiAnalysisService.analyze({
      name: project.name,
      description: project.description,
      status: project.status,
      risk: project.risk,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
    });

    project.setAiAnalysis(result);
    await this.projectsRepository.update(project);

    return result;
  }
}
