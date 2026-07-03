import { Injectable, NotFoundException } from "@nestjs/common";
import type { Project } from "../domain/project.entity";
import type { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class GetProjectUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(id: string): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }
}
