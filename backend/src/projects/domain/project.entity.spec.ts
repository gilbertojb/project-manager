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

  it("should allow cancellation from analysis status", () => {
    const project = Project.create(baseProps);
    expect(() => project.transitionTo(ProjectStatus.CANCELLED)).not.toThrow();
  });

  it("should allow cancellation from closed status", () => {
    const project = Project.create(baseProps);
    project.transitionTo(ProjectStatus.APPROVED);
    project.transitionTo(ProjectStatus.IN_PROGRESS);
    project.transitionTo(ProjectStatus.CLOSED);
    expect(() => project.transitionTo(ProjectStatus.CANCELLED)).not.toThrow();
    expect(project.status).toBe(ProjectStatus.CANCELLED);
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
