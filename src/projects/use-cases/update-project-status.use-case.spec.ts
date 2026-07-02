import { describe, it, expect, beforeEach } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { InMemoryProjectsRepository } from "../persistence/in-memory-projects.repository";
import { UpdateProjectStatusUseCase } from "./update-project-status.use-case";
import { Project } from "../domain/project.entity";
import { ProjectStatus } from "../domain/project.types";

describe("UpdateProjectStatusUseCase", () => {
  let repo: InMemoryProjectsRepository;
  let sut: UpdateProjectStatusUseCase;

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
    sut = new UpdateProjectStatusUseCase(repo);
  });

  it("should advance from analysis to approved", async () => {
    const project = makeProject();
    await repo.create(project);
    const updated = await sut.execute(project.id, ProjectStatus.APPROVED);
    expect(updated.status).toBe(ProjectStatus.APPROVED);
  });

  it("should throw BadRequestException when skipping a step", async () => {
    const project = makeProject();
    await repo.create(project);
    await expect(sut.execute(project.id, ProjectStatus.IN_PROGRESS)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should allow cancellation from any status", async () => {
    const project = makeProject();
    await repo.create(project);
    const updated = await sut.execute(project.id, ProjectStatus.CANCELLED);
    expect(updated.status).toBe(ProjectStatus.CANCELLED);
  });

  it("should complete the full status sequence", async () => {
    const project = makeProject();
    await repo.create(project);

    await sut.execute(project.id, ProjectStatus.APPROVED);
    await sut.execute(project.id, ProjectStatus.IN_PROGRESS);
    const final = await sut.execute(project.id, ProjectStatus.CLOSED);

    expect(final.status).toBe(ProjectStatus.CLOSED);
  });

  it("should throw NotFoundException for unknown project", async () => {
    await expect(sut.execute("unknown", ProjectStatus.APPROVED)).rejects.toThrow(NotFoundException);
  });
});
