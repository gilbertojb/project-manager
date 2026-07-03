import type { Project } from "../domain/project.entity";

export interface ProjectHttpResponse {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
  status: string;
  risk: string;
  createdAt: string;
  updatedAt: string;
}

export function toHttp(project: Project): ProjectHttpResponse {
  return {
    id: project.id,
    name: project.name,
    startDate: project.startDate.toISOString(),
    endDate: project.endDate.toISOString(),
    budget: project.budget,
    description: project.description,
    status: project.status,
    risk: project.risk,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function toHttpList(projects: Project[]): ProjectHttpResponse[] {
  return projects.map(toHttp);
}
