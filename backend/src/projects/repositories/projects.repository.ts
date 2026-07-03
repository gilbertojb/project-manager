import type { Project } from "../domain/project.entity";

export abstract class IProjectsRepository {
  abstract findAll(): Promise<Project[]>;
  abstract findById(id: string): Promise<Project | null>;
  abstract create(project: Project): Promise<void>;
  abstract update(project: Project): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
