import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Project } from "../src/projects/domain/project.entity";
import { ProjectStatus } from "../src/projects/domain/project.types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

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
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  };
}

async function main() {
  // LOW risk, status: analysis
  const p1 = Project.create({
    name: "Landing Page Institucional",
    startDate: new Date("2026-08-01"),
    endDate: new Date("2026-09-30"),
    budget: 30000,
    description: "Criação de landing page institucional para divulgação da marca.",
  });

  // MEDIUM risk, status: approved
  const p2 = Project.create({
    name: "Integração com CRM",
    startDate: new Date("2026-07-01"),
    endDate: new Date("2026-10-31"),
    budget: 95000,
    description: "Integração do sistema atual com CRM via API REST.",
  });
  p2.transitionTo(ProjectStatus.APPROVED);

  // HIGH risk, status: in_progress
  const p3 = Project.create({
    name: "Sistema de Gestão Financeira",
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-12-15"),
    budget: 750000,
    description: "Sistema integrado de gestão financeira e contabilidade.",
  });
  p3.transitionTo(ProjectStatus.APPROVED);
  p3.transitionTo(ProjectStatus.IN_PROGRESS);

  // HIGH risk, status: closed
  const p4 = Project.create({
    name: "Plataforma de E-commerce",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-10-31"),
    budget: 600000,
    description: "Plataforma de e-commerce B2C com gateway de pagamento integrado.",
  });
  p4.transitionTo(ProjectStatus.APPROVED);
  p4.transitionTo(ProjectStatus.IN_PROGRESS);
  p4.transitionTo(ProjectStatus.CLOSED);

  // MEDIUM risk, status: cancelled
  const p5 = Project.create({
    name: "App Mobile de Vendas",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-09-30"),
    budget: 180000,
    description: "Aplicativo mobile para equipe de vendas com catálogo e pedidos.",
  });
  p5.transitionTo(ProjectStatus.CANCELLED);

  await prisma.$transaction([
    prisma.project.deleteMany(),
    ...([p1, p2, p3, p4, p5].map((p) => prisma.project.create({ data: toRow(p) }))),
  ]);

  console.log("Seed concluído: 5 projetos inseridos.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
