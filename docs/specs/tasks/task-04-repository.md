# Task 04 — Repository: Interface + In-Memory Implementation

## Context
Requires Task 03 complete (`Project` entity available). The abstract class `IProjectsRepository` doubles as the NestJS injection token.

## Files
- Create: `src/projects/repositories/projects.repository.ts`
- Create: `src/projects/persistence/in-memory-projects.repository.ts`
- Test: `src/projects/persistence/in-memory-projects.repository.spec.ts`

## Produces
- `IProjectsRepository` (abstract class — NestJS DI token)
- `InMemoryProjectsRepository` (concrete implementation with `Map<string, Project>`)

## Consumed By
All use-cases (Tasks 05, 06, 07)

---

- [ ] **Step 1: Create repository interface**

```typescript
// src/projects/repositories/projects.repository.ts
import { Project } from "../domain/project.entity";

export abstract class IProjectsRepository {
  abstract findAll(): Promise<Project[]>;
  abstract findById(id: string): Promise<Project | null>;
  abstract create(project: Project): Promise<void>;
  abstract update(project: Project): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
```

- [ ] **Step 2: Write in-memory repository tests**

```typescript
// src/projects/persistence/in-memory-projects.repository.spec.ts
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
```

- [ ] **Step 3: Run tests — must fail**

```bash
npm run test:unit
```

Expected: FAIL — `Cannot find module './in-memory-projects.repository'`

- [ ] **Step 4: Implement InMemoryProjectsRepository**

```typescript
// src/projects/persistence/in-memory-projects.repository.ts
import { Injectable } from "@nestjs/common";
import { Project } from "../domain/project.entity";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class InMemoryProjectsRepository implements IProjectsRepository {
  private projects: Map<string, Project> = new Map();

  async findAll(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async findById(id: string): Promise<Project | null> {
    return this.projects.get(id) ?? null;
  }

  async create(project: Project): Promise<void> {
    this.projects.set(project.id, project);
  }

  async update(project: Project): Promise<void> {
    this.projects.set(project.id, project);
  }

  async delete(id: string): Promise<void> {
    this.projects.delete(id);
  }
}
```

- [ ] **Step 5: Run tests — must pass**

```bash
npm run test:unit
```

Expected: PASS — all 5 repository tests green

- [ ] **Step 6: Commit**

```bash
git add src/projects/repositories/ src/projects/persistence/
git commit -m "feat: add IProjectsRepository interface and in-memory implementation"
```
