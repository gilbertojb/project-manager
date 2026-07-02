# Task 08 — HTTP Layer: DTOs, Presenter, Controller

## Context
Requires Tasks 05–07 complete. The HTTP layer is the boundary where Portuguese API field names (DTOs, responses) are translated to/from English domain names. The controller is responsible for this mapping — use-cases only work with `ProjectProps` (English).

## Files
- Create: `src/shared/pipes/zod-validation.pipe.ts`
- Create: `src/projects/http/dtos/create-project.dto.ts`
- Create: `src/projects/http/dtos/update-project.dto.ts`
- Create: `src/projects/http/dtos/update-status.dto.ts`
- Create: `src/projects/http/project.presenter.ts`
- Create: `src/projects/http/projects.controller.ts`

## Field Name Mapping (Portuguese API ↔ English Domain)
| API (PT) | Domain (EN) |
|----------|-------------|
| nome | name |
| dataInicio | startDate |
| previsaoTermino | endDate |
| orcamentoTotal | budget |
| descricao | description |
| risco | risk (response only) |
| criadoEm | createdAt (response only) |
| atualizadoEm | updatedAt (response only) |

## Status/Risk values in HTTP responses
Status values: `analysis`, `approved`, `in_progress`, `closed`, `cancelled`
Risk values: `low`, `medium`, `high`

---

- [ ] **Step 1: Create ZodValidationPipe**

```typescript
// src/shared/pipes/zod-validation.pipe.ts
import { PipeTransform, BadRequestException } from "@nestjs/common";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }
    return result.data;
  }
}
```

- [ ] **Step 2: Create DTOs with Zod schemas (Portuguese field names)**

```typescript
// src/projects/http/dtos/create-project.dto.ts
import { z } from "zod";

export const createProjectSchema = z
  .object({
    nome: z.string().min(1, "nome is required").max(200),
    dataInicio: z.coerce.date({ required_error: "dataInicio is required" }),
    previsaoTermino: z.coerce.date({ required_error: "previsaoTermino is required" }),
    orcamentoTotal: z
      .number({ required_error: "orcamentoTotal is required" })
      .positive("orcamentoTotal must be positive"),
    descricao: z.string().min(1, "descricao is required"),
  })
  .refine((data) => data.previsaoTermino > data.dataInicio, {
    message: "previsaoTermino must be after dataInicio",
    path: ["previsaoTermino"],
  });

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
```

```typescript
// src/projects/http/dtos/update-project.dto.ts
import { z } from "zod";

export const updateProjectSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  dataInicio: z.coerce.date().optional(),
  previsaoTermino: z.coerce.date().optional(),
  orcamentoTotal: z.number().positive().optional(),
  descricao: z.string().min(1).optional(),
});

export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
```

```typescript
// src/projects/http/dtos/update-status.dto.ts
import { z } from "zod";
import { ProjectStatus } from "../../domain/project.types";

export const updateStatusSchema = z.object({
  status: z.nativeEnum(ProjectStatus, {
    errorMap: () => ({
      message: `status must be one of: ${Object.values(ProjectStatus).join(", ")}`,
    }),
  }),
});

export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
```

- [ ] **Step 3: Create ProjectPresenter (maps English entity → Portuguese HTTP response)**

```typescript
// src/projects/http/project.presenter.ts
import { Project } from "../domain/project.entity";

export interface ProjectHttpResponse {
  id: string;
  nome: string;
  dataInicio: string;
  previsaoTermino: string;
  orcamentoTotal: number;
  descricao: string;
  status: string;
  risco: string;
  criadoEm: string;
  atualizadoEm: string;
}

export class ProjectPresenter {
  static toHttp(project: Project): ProjectHttpResponse {
    return {
      id: project.id,
      nome: project.name,
      dataInicio: project.startDate.toISOString(),
      previsaoTermino: project.endDate.toISOString(),
      orcamentoTotal: project.budget,
      descricao: project.description,
      status: project.status,
      risco: project.risk,
      criadoEm: project.createdAt.toISOString(),
      atualizadoEm: project.updatedAt.toISOString(),
    };
  }

  static toHttpList(projects: Project[]): ProjectHttpResponse[] {
    return projects.map(ProjectPresenter.toHttp);
  }
}
```

- [ ] **Step 4: Create ProjectsController (maps Portuguese DTO → English domain)**

```typescript
// src/projects/http/projects.controller.ts
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
import { CreateProjectDto, createProjectSchema } from "./dtos/create-project.dto";
import { UpdateProjectDto, updateProjectSchema } from "./dtos/update-project.dto";
import { UpdateStatusDto, updateStatusSchema } from "./dtos/update-status.dto";
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
```

- [ ] **Step 5: Commit**

```bash
git add src/projects/http/ src/shared/pipes/
git commit -m "feat: add HTTP layer with controller, Zod DTOs, presenter and validation pipe"
```
