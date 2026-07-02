import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryProjectsRepository } from "../persistence/in-memory-projects.repository";
import { ListProjectsUseCase } from "./list-projects.use-case";
import { Project } from "../domain/project.entity";

const make = () =>
  Project.create({
    name: "P",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-02-01"),
    budget: 50000,
    description: "desc",
  });

describe("ListProjectsUseCase", () => {
  let repo: InMemoryProjectsRepository;
  let sut: ListProjectsUseCase;

  beforeEach(() => {
    repo = new InMemoryProjectsRepository();
    sut = new ListProjectsUseCase(repo);
  });

  it("should return all projects", async () => {
    await repo.create(make());
    await repo.create(make());
    expect(await sut.execute()).toHaveLength(2);
  });

  it("should return empty array when no projects exist", async () => {
    expect(await sut.execute()).toHaveLength(0);
  });
});
