# Task 03 — Domain: Project Entity and Types

## Context
Requires Task 01 complete. Zero framework dependency — pure TypeScript. Uses English field names throughout.

## Files
- Create: `src/projects/domain/project.types.ts`
- Create: `src/projects/domain/project.entity.ts`
- Test: `src/projects/domain/project.entity.spec.ts`

## Produces
- `ProjectStatus` enum with values: `analysis`, `approved`, `in_progress`, `closed`, `cancelled`
- `ProjectRisk` enum with values: `low`, `medium`, `high`
- `STATUS_TRANSITIONS` map
- `UNDELETABLE_STATUSES` constant
- `ProjectProps` interface: `{ name, startDate, endDate, budget, description }`
- `ProjectData` interface: `ProjectProps + { id, status, risk, createdAt, updatedAt }`
- `Project` class with `create()`, `restore()`, `transitionTo()`, `update()`, `isDeletable()`, getters

## Risk Calculation Rules
- budget ≤ 100k AND duration ≤ 3 months → LOW
- budget between 100k–500k OR duration > 3 months and ≤ 6 months → MEDIUM
- budget > 500k OR duration > 6 months → HIGH
- When multiple rules apply, the highest risk wins

---

- [ ] **Step 1: Create project.types.ts**

```typescript
export enum ProjectStatus {
  ANALYSIS = "analysis",
  APPROVED = "approved",
  IN_PROGRESS = "in_progress",
  CLOSED = "closed",
  CANCELLED = "cancelled",
}

export enum ProjectRisk {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export const STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.ANALYSIS]: [ProjectStatus.APPROVED, ProjectStatus.CANCELLED],
  [ProjectStatus.APPROVED]: [ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED],
  [ProjectStatus.IN_PROGRESS]: [ProjectStatus.CLOSED, ProjectStatus.CANCELLED],
  [ProjectStatus.CLOSED]: [],
  [ProjectStatus.CANCELLED]: [],
};

export const UNDELETABLE_STATUSES = [ProjectStatus.IN_PROGRESS, ProjectStatus.CLOSED];
```

- [ ] **Step 2: Write entity tests BEFORE implementing**

```typescript
// src/projects/domain/project.entity.spec.ts
import { describe, it, expect } from "vitest";
import { Project } from "./project.entity";
import { ProjectStatus, ProjectRisk } from "./project.types";

describe("Project Entity", () => {
  const baseProps = {
    name: "Test Project",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-02-01"), // 1 month → Low risk
    budget: 50000,
    description: "Description",
  };

  it("should create a project with analysis status by default", () => {
    const project = Project.create(baseProps);
    expect(project.status).toBe(ProjectStatus.ANALYSIS);
  });

  it("should calculate low risk for budget ≤ 100k and duration ≤ 3 months", () => {
    const project = Project.create(baseProps);
    expect(project.risk).toBe(ProjectRisk.LOW);
  });

  it("should calculate medium risk for budget between 100k and 500k", () => {
    const project = Project.create({ ...baseProps, budget: 200000 });
    expect(project.risk).toBe(ProjectRisk.MEDIUM);
  });

  it("should calculate medium risk for duration between 3 and 6 months", () => {
    const project = Project.create({
      ...baseProps,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-05-01"), // 4 months
    });
    expect(project.risk).toBe(ProjectRisk.MEDIUM);
  });

  it("should calculate high risk for budget above 500k", () => {
    const project = Project.create({ ...baseProps, budget: 600000 });
    expect(project.risk).toBe(ProjectRisk.HIGH);
  });

  it("should calculate high risk for duration above 6 months", () => {
    const project = Project.create({
      ...baseProps,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-10-01"), // 9 months
    });
    expect(project.risk).toBe(ProjectRisk.HIGH);
  });

  it("should use the highest risk level when multiple rules apply", () => {
    const project = Project.create({
      ...baseProps,
      budget: 200000, // medium
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-10-01"), // high (9 months)
    });
    expect(project.risk).toBe(ProjectRisk.HIGH);
  });

  it("should allow transition from analysis to approved", () => {
    const project = Project.create(baseProps);
    expect(() => project.transitionTo(ProjectStatus.APPROVED)).not.toThrow();
    expect(project.status).toBe(ProjectStatus.APPROVED);
  });

  it("should throw when skipping a status step", () => {
    const project = Project.create(baseProps);
    expect(() => project.transitionTo(ProjectStatus.IN_PROGRESS)).toThrow(
      "Invalid status transition",
    );
  });

  it("should allow cancellation from any status", () => {
    const project = Project.create(baseProps);
    expect(() => project.transitionTo(ProjectStatus.CANCELLED)).not.toThrow();
  });

  it("should recalculate risk when budget is updated", () => {
    const project = Project.create(baseProps);
    expect(project.risk).toBe(ProjectRisk.LOW);
    project.update({ budget: 600000 });
    expect(project.risk).toBe(ProjectRisk.HIGH);
  });

  it("should return isDeletable() false for in_progress projects", () => {
    const project = Project.create(baseProps);
    project.transitionTo(ProjectStatus.APPROVED);
    project.transitionTo(ProjectStatus.IN_PROGRESS);
    expect(project.isDeletable()).toBe(false);
  });

  it("should return isDeletable() false for closed projects", () => {
    const project = Project.create(baseProps);
    project.transitionTo(ProjectStatus.APPROVED);
    project.transitionTo(ProjectStatus.IN_PROGRESS);
    project.transitionTo(ProjectStatus.CLOSED);
    expect(project.isDeletable()).toBe(false);
  });

  it("should return isDeletable() true for analysis projects", () => {
    const project = Project.create(baseProps);
    expect(project.isDeletable()).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests — they must fail**

```bash
npm run test:unit
```

Expected: FAIL — `Cannot find module './project.entity'`

- [ ] **Step 4: Implement project.entity.ts**

```typescript
import { randomUUID } from "node:crypto";
import {
  ProjectStatus,
  ProjectRisk,
  STATUS_TRANSITIONS,
  UNDELETABLE_STATUSES,
} from "./project.types";

export interface ProjectProps {
  name: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  description: string;
}

export interface ProjectData extends ProjectProps {
  id: string;
  status: ProjectStatus;
  risk: ProjectRisk;
  createdAt: Date;
  updatedAt: Date;
}

export class Project {
  private _data: ProjectData;

  private constructor(data: ProjectData) {
    this._data = data;
  }

  static create(props: ProjectProps): Project {
    const now = new Date();
    const risk = Project.calculateRisk(props.budget, props.startDate, props.endDate);
    return new Project({
      ...props,
      id: randomUUID(),
      status: ProjectStatus.ANALYSIS,
      risk,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(data: ProjectData): Project {
    return new Project(data);
  }

  private static calculateRisk(budget: number, startDate: Date, endDate: Date): ProjectRisk {
    const durationInMonths =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    const riskFromBudget =
      budget > 500000 ? ProjectRisk.HIGH : budget > 100000 ? ProjectRisk.MEDIUM : ProjectRisk.LOW;

    const riskFromDuration =
      durationInMonths > 6
        ? ProjectRisk.HIGH
        : durationInMonths > 3
          ? ProjectRisk.MEDIUM
          : ProjectRisk.LOW;

    const order = [ProjectRisk.LOW, ProjectRisk.MEDIUM, ProjectRisk.HIGH];
    return order[Math.max(order.indexOf(riskFromBudget), order.indexOf(riskFromDuration))];
  }

  transitionTo(newStatus: ProjectStatus): void {
    const allowed = STATUS_TRANSITIONS[this._data.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid status transition: ${this._data.status} → ${newStatus}`);
    }
    this._data.status = newStatus;
    this._data.updatedAt = new Date();
  }

  update(props: Partial<ProjectProps>): void {
    this._data = { ...this._data, ...props, updatedAt: new Date() };
    if (props.budget !== undefined || props.startDate || props.endDate) {
      this._data.risk = Project.calculateRisk(
        this._data.budget,
        this._data.startDate,
        this._data.endDate,
      );
    }
  }

  isDeletable(): boolean {
    return !UNDELETABLE_STATUSES.includes(this._data.status);
  }

  get id() { return this._data.id; }
  get name() { return this._data.name; }
  get startDate() { return this._data.startDate; }
  get endDate() { return this._data.endDate; }
  get budget() { return this._data.budget; }
  get description() { return this._data.description; }
  get status() { return this._data.status; }
  get risk() { return this._data.risk; }
  get createdAt() { return this._data.createdAt; }
  get updatedAt() { return this._data.updatedAt; }
  get data(): ProjectData { return { ...this._data }; }
}
```

- [ ] **Step 5: Run tests — they must pass**

```bash
npm run test:unit
```

Expected: PASS — all 14 entity tests green

- [ ] **Step 6: Commit**

```bash
git add src/projects/domain/
git commit -m "feat: add Project entity with risk calculation and status transition rules"
```
