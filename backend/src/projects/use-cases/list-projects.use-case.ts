import { Injectable } from "@nestjs/common";
import type { Project } from "../domain/project.entity";
import type { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class ListProjectsUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectsRepository.findAll();
  }
}
