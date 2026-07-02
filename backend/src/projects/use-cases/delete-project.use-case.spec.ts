import { describe, it, expect, beforeEach } from "vitest";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { InMemoryProjectsRepository } from "../persistence/in-memory-projects.repository";
import { DeleteProjectUseCase } from "./delete-project.use-case";
import { Project } from "../domain/project.entity";
import { ProjectStatus } from "../domain/project.types";

describe("DeleteProjectUseCase", () => {
  let repo: InMemoryProjectsRepository;
  let sut: DeleteProjectUseCase;

  const makeProject = () =>
    Project.create({
      name: "T",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-02-01"),
      budget: 50000,
      description: "desc",
    });

  beforeEach(() => {
    repo = new InMemoryProjectsRepository();
    sut = new DeleteProjectUseCase(repo);
  });

  it("should delete analysis project", async () => {
    const project = makeProject();
    await repo.create(project);
    await sut.execute(project.id);
    expect(await repo.findById(project.id)).toBeNull();
  });

  it("should throw BadRequestException for in_progress project", async () => {
    const project = makeProject();
    project.transitionTo(ProjectStatus.APPROVED);
    project.transitionTo(ProjectStatus.IN_PROGRESS);
    await repo.create(project);
    await expect(sut.execute(project.id)).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException for closed project", async () => {
    const project = makeProject();
    project.transitionTo(ProjectStatus.APPROVED);
    project.transitionTo(ProjectStatus.IN_PROGRESS);
    project.transitionTo(ProjectStatus.CLOSED);
    await repo.create(project);
    await expect(sut.execute(project.id)).rejects.toThrow(BadRequestException);
  });

  it("should throw NotFoundException for unknown id", async () => {
    await expect(sut.execute("unknown")).rejects.toThrow(NotFoundException);
  });
});
