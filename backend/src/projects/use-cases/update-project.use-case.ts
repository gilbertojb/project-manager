import { Injectable, NotFoundException } from "@nestjs/common";
import { Project, ProjectProps } from "../domain/project.entity";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class UpdateProjectUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(id: string, props: Partial<ProjectProps>): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException("Project not found");
    project.update(props);
    await this.projectsRepository.update(project);
    return project;
  }
}
