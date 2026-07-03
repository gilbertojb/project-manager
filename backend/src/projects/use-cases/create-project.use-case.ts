import { Injectable } from "@nestjs/common";
import { Project, type ProjectProps } from "../domain/project.entity";
import type { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class CreateProjectUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(props: ProjectProps): Promise<Project> {
    const project = Project.create(props);
    await this.projectsRepository.create(project);
    return project;
  }
}
