import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ZodValidationPipe } from "../../shared/pipes/zod-validation.pipe";
import { CreateProjectUseCase } from "../use-cases/create-project.use-case";
import { ListProjectsUseCase } from "../use-cases/list-projects.use-case";
import { GetProjectUseCase } from "../use-cases/get-project.use-case";
import { UpdateProjectUseCase } from "../use-cases/update-project.use-case";
import { DeleteProjectUseCase } from "../use-cases/delete-project.use-case";
import { UpdateProjectStatusUseCase } from "../use-cases/update-project-status.use-case";
import { GetAiAnalysisUseCase } from "../use-cases/get-ai-analysis.use-case";
import type { CreateProjectDto } from "./dtos/create-project.dto";
import { createProjectSchema } from "./dtos/create-project.dto";
import type { UpdateProjectDto } from "./dtos/update-project.dto";
import { updateProjectSchema } from "./dtos/update-project.dto";
import type { UpdateStatusDto } from "./dtos/update-status.dto";
import { updateStatusSchema } from "./dtos/update-status.dto";
import { ProjectPresenter } from "./project.presenter";

@ApiTags("projects")
@Controller("projects")
export class ProjectsController {
  constructor(
    private readonly createProject: CreateProjectUseCase,
    private readonly listProjects: ListProjectsUseCase,
    private readonly getProject: GetProjectUseCase,
    private readonly updateProject: UpdateProjectUseCase,
    private readonly deleteProject: DeleteProjectUseCase,
    private readonly updateStatus: UpdateProjectStatusUseCase,
    private readonly getAiAnalysis: GetAiAnalysisUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new project" })
  @ApiResponse({ status: 201, description: "Project created successfully" })
  async create(@Body(new ZodValidationPipe(createProjectSchema)) dto: CreateProjectDto) {
    const project = await this.createProject.execute({
      name: dto.nome,
      startDate: dto.dataInicio,
      endDate: dto.previsaoTermino,
      budget: dto.orcamentoTotal,
      description: dto.descricao,
    });
    return ProjectPresenter.toHttp(project);
  }

  @Get()
  @ApiOperation({ summary: "List all projects" })
  async list() {
    return ProjectPresenter.toHttpList(await this.listProjects.execute());
  }

  @Get(":id")
  @ApiOperation({ summary: "Get project by ID" })
  @ApiResponse({ status: 404, description: "Project not found" })
  async findOne(@Param("id") id: string) {
    return ProjectPresenter.toHttp(await this.getProject.execute(id));
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update project fields" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateProjectSchema)) dto: UpdateProjectDto,
  ) {
    const project = await this.updateProject.execute(id, {
      ...(dto.nome !== undefined && { name: dto.nome }),
      ...(dto.dataInicio !== undefined && { startDate: dto.dataInicio }),
      ...(dto.previsaoTermino !== undefined && { endDate: dto.previsaoTermino }),
      ...(dto.orcamentoTotal !== undefined && { budget: dto.orcamentoTotal }),
      ...(dto.descricao !== undefined && { description: dto.descricao }),
    });
    return ProjectPresenter.toHttp(project);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete project" })
  @ApiResponse({ status: 400, description: "Cannot delete in_progress or closed projects" })
  async remove(@Param("id") id: string) {
    await this.deleteProject.execute(id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Advance project status" })
  async changeStatus(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateStatusSchema)) dto: UpdateStatusDto,
  ) {
    return ProjectPresenter.toHttp(await this.updateStatus.execute(id, dto.status));
  }

  @Get(":id/ai-analysis")
  @ApiOperation({ summary: "Generate AI analysis for project" })
  async aiAnalysis(@Param("id") id: string) {
    return this.getAiAnalysis.execute(id);
  }
}
