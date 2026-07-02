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
    if (props.budget !== undefined || props.startDate !== undefined || props.endDate !== undefined) {
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
