import { describe, it, expect, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { InMemoryProjectsRepository } from "../persistence/in-memory-projects.repository";
import { UpdateProjectUseCase } from "./update-project.use-case";
import { Project } from "../domain/project.entity";
import { ProjectRisk } from "../domain/project.types";

describe("UpdateProjectUseCase", () => {
  let repo: InMemoryProjectsRepository;
  let sut: UpdateProjectUseCase;

  beforeEach(() => {
    repo = new InMemoryProjectsRepository();
    sut = new UpdateProjectUseCase(repo);
  });

  it("should update fields and recalculate risk", async () => {
    const project = Project.create({
      name: "T",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      budget: 50000,
      description: "desc",
    });
    await repo.create(project);

    const updated = await sut.execute(project.id, { budget: 150000 });

    expect(updated.budget).toBe(150000);
    expect(updated.risk).toBe(ProjectRisk.MEDIUM);
  });

  it("should throw NotFoundException for unknown id", async () => {
    await expect(sut.execute("unknown", { budget: 100000 })).rejects.toThrow(NotFoundException);
  });
});
