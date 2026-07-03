import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateProjectUseCase } from "@/projects/use-cases/create-project.use-case";
import { DeleteProjectUseCase } from "@/projects/use-cases/delete-project.use-case";
import { GetAiAnalysisUseCase } from "@/projects/use-cases/get-ai-analysis.use-case";
import { GetProjectUseCase } from "@/projects/use-cases/get-project.use-case";
import { ListProjectsUseCase } from "@/projects/use-cases/list-projects.use-case";
import { UpdateProjectUseCase } from "@/projects/use-cases/update-project.use-case";
import { UpdateProjectStatusUseCase } from "@/projects/use-cases/update-project-status.use-case";

import { ZodValidationPipe } from "@/shared/pipes/zod-validation.pipe";

import type { CreateProjectDto } from "./dtos/create-project.dto";
import { createProjectSchema } from "./dtos/create-project.dto";
import type { UpdateProjectDto } from "./dtos/update-project.dto";
import { updateProjectSchema } from "./dtos/update-project.dto";
import type { UpdateStatusDto } from "./dtos/update-status.dto";
import { updateStatusSchema } from "./dtos/update-status.dto";
import { toHttp, toHttpList } from "./project.presenter";

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
  async create(@Body(new ZodValidationPipe(createProjectSchema)) body: CreateProjectDto) {
    return toHttp(await this.createProject.execute(body));
  }

  @Get()
  @ApiOperation({ summary: "List all projects" })
  async list() {
    return toHttpList(await this.listProjects.execute());
  }

  @Get(":id")
  @ApiOperation({ summary: "Get project by ID" })
  @ApiResponse({ status: 404, description: "Project not found" })
  async findOne(@Param("id") id: string) {
    return toHttp(await this.getProject.execute(id));
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update project fields" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateProjectSchema)) body: UpdateProjectDto,
  ) {
    const project = await this.updateProject.execute(id, {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.startDate !== undefined && { startDate: body.startDate }),
      ...(body.endDate !== undefined && { endDate: body.endDate }),
      ...(body.budget !== undefined && { budget: body.budget }),
      ...(body.description !== undefined && { description: body.description }),
    });
    return toHttp(project);
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
    @Body(new ZodValidationPipe(updateStatusSchema)) body: UpdateStatusDto,
  ) {
    return toHttp(await this.updateStatus.execute(id, body.status));
  }

  @Get(":id/ai-analysis")
  @ApiOperation({ summary: "Generate AI analysis for project" })
  async aiAnalysis(@Param("id") id: string) {
    return this.getAiAnalysis.execute(id);
  }
}
