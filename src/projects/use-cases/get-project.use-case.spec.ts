import { describe, it, expect, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { InMemoryProjectsRepository } from "../persistence/in-memory-projects.repository";
import { GetProjectUseCase } from "./get-project.use-case";
import { Project } from "../domain/project.entity";

describe("GetProjectUseCase", () => {
  let repo: InMemoryProjectsRepository;
  let sut: GetProjectUseCase;

  beforeEach(() => {
    repo = new InMemoryProjectsRepository();
    sut = new GetProjectUseCase(repo);
  });

  it("should return project by id", async () => {
    const project = Project.create({
      name: "T",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      budget: 50000,
      description: "desc",
    });
    await repo.create(project);
    const found = await sut.execute(project.id);
    expect(found.id).toBe(project.id);
  });

  it("should throw NotFoundException for unknown id", async () => {
    await expect(sut.execute("unknown")).rejects.toThrow(NotFoundException);
  });
});
