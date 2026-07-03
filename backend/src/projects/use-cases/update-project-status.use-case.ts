import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import type { Project } from "@/projects/domain/project.entity";
import type { ProjectStatus } from "@/projects/domain/project.types";
import { IProjectsRepository } from "@/projects/repositories/projects.repository";

@Injectable()
export class UpdateProjectStatusUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(id: string, newStatus: ProjectStatus): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException("Project not found");

    try {
      project.transitionTo(newStatus);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    await this.projectsRepository.update(project);
    return project;
  }
}
