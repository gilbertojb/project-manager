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

import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

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
import {
  aiAnalysisSchema,
  createProjectBodySchema,
  errorSchema,
  projectSchema,
  updateProjectBodySchema,
  updateStatusBodySchema,
} from "./openapi-schemas";
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
  @ApiOperation({ summary: "Criar projeto", description: "Cria um novo projeto. O risco é calculado automaticamente com base no orçamento e prazo." })
  @ApiBody({ schema: createProjectBodySchema })
  @ApiResponse({ status: 201, description: "Projeto criado com sucesso", schema: projectSchema })
  @ApiResponse({ status: 400, description: "Dados inválidos", schema: errorSchema })
  async create(@Body(new ZodValidationPipe(createProjectSchema)) body: CreateProjectDto) {
    return toHttp(await this.createProject.execute(body));
  }

  @Get()
  @ApiOperation({ summary: "Listar projetos", description: "Retorna todos os projetos cadastrados." })
  @ApiResponse({ status: 200, description: "Lista de projetos", schema: { type: "array", items: projectSchema } })
  async list() {
    return toHttpList(await this.listProjects.execute());
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar projeto por ID" })
  @ApiResponse({ status: 200, description: "Projeto encontrado", schema: projectSchema })
  @ApiResponse({ status: 404, description: "Projeto não encontrado", schema: errorSchema })
  async findOne(@Param("id") id: string) {
    return toHttp(await this.getProject.execute(id));
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar projeto", description: "Atualiza campos do projeto. O risco é recalculado automaticamente se orçamento ou datas forem alterados." })
  @ApiBody({ schema: updateProjectBodySchema })
  @ApiResponse({ status: 200, description: "Projeto atualizado", schema: projectSchema })
  @ApiResponse({ status: 404, description: "Projeto não encontrado", schema: errorSchema })
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
  @ApiOperation({ summary: "Remover projeto", description: "Remove o projeto. Projetos com status `in_progress` ou `closed` não podem ser removidos." })
  @ApiResponse({ status: 204, description: "Projeto removido com sucesso" })
  @ApiResponse({ status: 400, description: "Projeto não pode ser removido no status atual", schema: errorSchema })
  @ApiResponse({ status: 404, description: "Projeto não encontrado", schema: errorSchema })
  async remove(@Param("id") id: string) {
    await this.deleteProject.execute(id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Alterar status do projeto", description: "Avança o status seguindo a sequência: analysis → approved → in_progress → closed. Qualquer status pode ir para cancelled." })
  @ApiBody({ schema: updateStatusBodySchema })
  @ApiResponse({ status: 200, description: "Status atualizado", schema: projectSchema })
  @ApiResponse({ status: 400, description: "Transição de status inválida", schema: errorSchema })
  @ApiResponse({ status: 404, description: "Projeto não encontrado", schema: errorSchema })
  async changeStatus(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateStatusSchema)) body: UpdateStatusDto,
  ) {
    return toHttp(await this.updateStatus.execute(id, body.status));
  }

  @Get(":id/ai-analysis")
  @ApiOperation({ summary: "Análise executiva com IA", description: "Gera análise executiva do projeto usando o provider de IA configurado (Anthropic, Gemini ou OpenAI)." })
  @ApiResponse({ status: 200, description: "Análise gerada com sucesso", schema: aiAnalysisSchema })
  @ApiResponse({ status: 404, description: "Projeto não encontrado", schema: errorSchema })
  @ApiResponse({ status: 503, description: "Provider de IA indisponível", schema: errorSchema })
  async aiAnalysis(@Param("id") id: string) {
    return this.getAiAnalysis.execute(id);
  }
}
