import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryProjectsRepository } from "../persistence/in-memory-projects.repository";
import { CreateProjectUseCase } from "./create-project.use-case";
import { ProjectStatus, ProjectRisk } from "../domain/project.types";

describe("CreateProjectUseCase", () => {
  let repo: InMemoryProjectsRepository;
  let sut: CreateProjectUseCase;

  beforeEach(() => {
    repo = new InMemoryProjectsRepository();
    sut = new CreateProjectUseCase(repo);
  });

  it("should create project with analysis status and calculated risk", async () => {
    const project = await sut.execute({
      name: "My Project",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      budget: 50000,
      description: "Description",
    });

    expect(project.status).toBe(ProjectStatus.ANALYSIS);
    expect(project.risk).toBe(ProjectRisk.LOW);
    expect(project.id).toBeDefined();

    const saved = await repo.findById(project.id);
    expect(saved).not.toBeNull();
  });
});
