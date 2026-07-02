import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryProjectsRepository } from "./in-memory-projects.repository";
import { Project } from "../domain/project.entity";

const makeProject = () =>
  Project.create({
    name: "Test",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-02-01"),
    budget: 50000,
    description: "desc",
  });

describe("InMemoryProjectsRepository", () => {
  let repo: InMemoryProjectsRepository;

  beforeEach(() => {
    repo = new InMemoryProjectsRepository();
  });

  it("should create and list projects", async () => {
    const project = makeProject();
    await repo.create(project);
    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(project.id);
  });

  it("should find project by id", async () => {
    const project = makeProject();
    await repo.create(project);
    const found = await repo.findById(project.id);
    expect(found?.id).toBe(project.id);
  });

  it("should return null for unknown id", async () => {
    const found = await repo.findById("unknown");
    expect(found).toBeNull();
  });

  it("should update project", async () => {
    const project = makeProject();
    await repo.create(project);
    project.update({ name: "Updated Name" });
    await repo.update(project);
    const found = await repo.findById(project.id);
    expect(found?.name).toBe("Updated Name");
  });

  it("should delete project", async () => {
    const project = makeProject();
    await repo.create(project);
    await repo.delete(project.id);
    const found = await repo.findById(project.id);
    expect(found).toBeNull();
  });
});
