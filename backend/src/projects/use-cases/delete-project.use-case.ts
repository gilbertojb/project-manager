import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { IProjectsRepository } from "@/projects/repositories/projects.repository";

@Injectable()
export class DeleteProjectUseCase {
  constructor(private readonly projectsRepository: IProjectsRepository) {}

  async execute(id: string): Promise<void> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException("Project not found");
    if (!project.isDeletable()) {
      throw new BadRequestException(
        "Projects with status in_progress or closed cannot be deleted",
      );
    }
    await this.projectsRepository.delete(id);
  }
}
