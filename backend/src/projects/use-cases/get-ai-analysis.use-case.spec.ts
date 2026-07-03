import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { GetAiAnalysisUseCase } from "./get-ai-analysis.use-case";
import { InMemoryProjectsRepository } from "../persistence/in-memory-projects.repository";
import { AiAnalysisService } from "../ai/ai-analysis.service";
import { IAiClient, type AiAnalysisInput, type AiAnalysisResult } from "../ai/ai.client";
import { Project } from "../domain/project.entity";

class FakeAiClient extends IAiClient {
  analyze = vi.fn<[AiAnalysisInput], Promise<AiAnalysisResult>>();
}

describe("GetAiAnalysisUseCase", () => {
  let repo: InMemoryProjectsRepository;
  let fakeAiClient: FakeAiClient;
  let aiAnalysisService: AiAnalysisService;
  let sut: GetAiAnalysisUseCase;

  const mockResult: AiAnalysisResult = {
    summary: "Project is on track",
    attentionPoints: ["Budget is high", "Timeline is tight"],
    executiveRecommendation: "Proceed with caution",
  };

  beforeEach(() => {
    repo = new InMemoryProjectsRepository();
    fakeAiClient = new FakeAiClient();
    fakeAiClient.analyze.mockResolvedValue(mockResult);
    aiAnalysisService = new AiAnalysisService(fakeAiClient);
    sut = new GetAiAnalysisUseCase(repo, aiAnalysisService);
  });

  it("should throw NotFoundException when project does not exist", async () => {
    await expect(sut.execute("non-existent-id")).rejects.toThrow(NotFoundException);
  });

  it("should call aiAnalysisService.analyze with mapped project fields", async () => {
    const project = Project.create({
      name: "Alpha Project",
      description: "A test project",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-06-30"),
      budget: 150000,
    });
    await repo.create(project);

    await sut.execute(project.id);

    expect(fakeAiClient.analyze).toHaveBeenCalledOnce();
    expect(fakeAiClient.analyze).toHaveBeenCalledWith({
      name: project.name,
      description: project.description,
      status: project.status,
      risk: project.risk,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
    });
  });

  it("should return the AiAnalysisResult from the service", async () => {
    const project = Project.create({
      name: "Beta Project",
      description: "Another test project",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-09-01"),
      budget: 75000,
    });
    await repo.create(project);

    const result = await sut.execute(project.id);

    expect(result).toEqual(mockResult);
  });
});
