# Task 06 — Use-Case: Status Transition

## Context
Requires Tasks 03–05 complete. Status transition logic lives in the entity; this use-case calls `project.transitionTo()` and converts domain errors into HTTP exceptions.

## Files
- Create: `src/projects/use-cases/update-project-status.use-case.ts` + `.spec.ts`

## Produces
- `UpdateProjectStatusUseCase` with `execute(id: string, newStatus: ProjectStatus): Promise<Project>`

---

- [ ] **Step 1: Write status transition tests**

```typescript
// src/projects/use-cases/update-project-status.use-case.spec.ts
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
```

- [ ] **Step 2: Implement UpdateProjectStatusUseCase**

```typescript
// src/projects/use-cases/update-project-status.use-case.ts
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Project } from "../domain/project.entity";
import { ProjectStatus } from "../domain/project.types";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class UpdateProjectStatusUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(id: string, newStatus: ProjectStatus): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException("Project not found");

    try {
      project.transitionTo(newStatus);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    await this.projectsRepository.update(project);
    return project;
  }
}
```

- [ ] **Step 3: Run all tests**

```bash
npm run test:unit
```

Expected: PASS — all tests green including previous tasks

- [ ] **Step 4: Commit**

```bash
git add src/projects/use-cases/update-project-status.use-case.ts src/projects/use-cases/update-project-status.use-case.spec.ts
git commit -m "feat: add status transition use-case with sequence validation"
```
