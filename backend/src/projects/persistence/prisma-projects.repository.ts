import { Injectable } from "@nestjs/common";
import { Prisma, type Project as PrismaProject } from "@prisma/client";
import type { AiAnalysisData } from "@/projects/domain/project.entity";
import { Project } from "@/projects/domain/project.entity";
import type { ProjectRisk, ProjectStatus } from "@/projects/domain/project.types";
import { IProjectsRepository } from "@/projects/repositories/projects.repository";
import { PrismaService } from "@/shared/prisma/prisma.service";

function toDomain(raw: PrismaProject): Project {
  return Project.restore({
    id: raw.id,
    name: raw.name,
    startDate: raw.start_date,
    endDate: raw.end_date,
    budget: raw.budget,
    description: raw.description,
    status: raw.status as ProjectStatus,
    risk: raw.risk as ProjectRisk,
    aiAnalysis: raw.ai_analysis as AiAnalysisData | null,
    aiAnalyzedAt: raw.ai_analyzed_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  });
}

function toRow(project: Project) {
  return {
    id: project.id,
    name: project.name,
    start_date: project.startDate,
    end_date: project.endDate,
    budget: project.budget,
    description: project.description,
    status: project.status as string,
    risk: project.risk as string,
    ai_analysis: project.aiAnalysis ? (project.aiAnalysis as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
    ai_analyzed_at: project.aiAnalyzedAt,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

@Injectable()
export class PrismaProjectsRepository extends IProjectsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<Project[]> {
    const rows = await this.prisma.project.findMany();
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async create(project: Project): Promise<void> {
    await this.prisma.project.create({ data: toRow(project) });
  }

  async update(project: Project): Promise<void> {
    await this.prisma.project.update({ where: { id: project.id }, data: toRow(project) });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }
}
