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
  [ProjectStatus.CLOSED]: [ProjectStatus.CANCELLED],
  [ProjectStatus.CANCELLED]: [],
};

export const UNDELETABLE_STATUSES = [ProjectStatus.IN_PROGRESS, ProjectStatus.CLOSED];
