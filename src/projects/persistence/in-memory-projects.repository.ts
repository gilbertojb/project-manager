import { Injectable } from "@nestjs/common";
import { Project } from "../domain/project.entity";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class InMemoryProjectsRepository extends IProjectsRepository {
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
