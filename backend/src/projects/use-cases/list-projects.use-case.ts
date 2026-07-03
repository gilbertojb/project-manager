import { Injectable } from "@nestjs/common";
import type { Project } from "@/projects/domain/project.entity";
import { IProjectsRepository } from "@/projects/repositories/projects.repository";

@Injectable()
export class ListProjectsUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectsRepository.findAll();
  }
}
