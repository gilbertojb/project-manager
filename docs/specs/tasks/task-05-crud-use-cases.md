# Task 05 — Use-Cases: CRUD

## Context
Requires Tasks 03 and 04 complete. Use-cases are pure classes with no NestJS decorators except `@Injectable()`. They depend on `IProjectsRepository` (injected via constructor) and use English field names from the domain.

## Files
- Create: `src/projects/use-cases/create-project.use-case.ts` + `.spec.ts`
- Create: `src/projects/use-cases/list-projects.use-case.ts` + `.spec.ts`
- Create: `src/projects/use-cases/get-project.use-case.ts` + `.spec.ts`
- Create: `src/projects/use-cases/update-project.use-case.ts` + `.spec.ts`
- Create: `src/projects/use-cases/delete-project.use-case.ts` + `.spec.ts`

## Produces
Each use-case: injectable class with single `execute()` method.

## Key Business Rules (enforced here)
- `DeleteProjectUseCase`: throws `BadRequestException` if `!project.isDeletable()`
- `UpdateProjectUseCase`: triggers risk recalculation via `project.update()` (entity handles it)

---

- [ ] **Step 1: CreateProjectUseCase — test then implement**

```typescript
// src/projects/use-cases/create-project.use-case.spec.ts
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
```

```typescript
// src/projects/use-cases/create-project.use-case.ts
import { Injectable } from "@nestjs/common";
import { Project, ProjectProps } from "../domain/project.entity";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class CreateProjectUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(props: ProjectProps): Promise<Project> {
    const project = Project.create(props);
    await this.projectsRepository.create(project);
    return project;
  }
}
```

- [ ] **Step 2: ListProjectsUseCase — test then implement**

```typescript
// src/projects/use-cases/list-projects.use-case.spec.ts
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
```

```typescript
// src/projects/use-cases/list-projects.use-case.ts
import { Injectable } from "@nestjs/common";
import { Project } from "../domain/project.entity";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class ListProjectsUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectsRepository.findAll();
  }
}
```

- [ ] **Step 3: GetProjectUseCase — test then implement**

```typescript
// src/projects/use-cases/get-project.use-case.spec.ts
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
```

```typescript
// src/projects/use-cases/get-project.use-case.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { Project } from "../domain/project.entity";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class GetProjectUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(id: string): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }
}
```

- [ ] **Step 4: UpdateProjectUseCase — test then implement**

```typescript
// src/projects/use-cases/update-project.use-case.spec.ts
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
```

```typescript
// src/projects/use-cases/update-project.use-case.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { Project, ProjectProps } from "../domain/project.entity";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class UpdateProjectUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(id: string, props: Partial<ProjectProps>): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException("Project not found");
    project.update(props);
    await this.projectsRepository.update(project);
    return project;
  }
}
```

- [ ] **Step 5: DeleteProjectUseCase — test then implement**

```typescript
// src/projects/use-cases/delete-project.use-case.spec.ts
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
```

```typescript
// src/projects/use-cases/delete-project.use-case.ts
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class DeleteProjectUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(id: string): Promise<void> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException("Project not found");
    if (!project.isDeletable()) {
      throw new BadRequestException(
        "Projects with status in_progress or closed cannot be deleted",
      );
    }
    await this.projectsRepository.delete(id);
  }
}
```

- [ ] **Step 6: Run all tests**

```bash
npm run test:unit
```

Expected: PASS — all CRUD use-case tests green

- [ ] **Step 7: Commit**

```bash
git add src/projects/use-cases/
git commit -m "feat: add CRUD use-cases with business rule enforcement"
```
