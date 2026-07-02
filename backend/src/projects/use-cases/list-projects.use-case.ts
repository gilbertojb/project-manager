import { Injectable } from "@nestjs/common";
import { Project } from "../domain/project.entity";
import { IProjectsRepository } from "../repositories/projects.repository";

@Injectable()
export class ListProjectsUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectsRepository.findAll();
  }
}
