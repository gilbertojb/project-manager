import type { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export const projectSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
    name: { type: "string", example: "Sistema ERP" },
    startDate: { type: "string", format: "date-time", example: "2026-01-01T00:00:00.000Z" },
    endDate: { type: "string", format: "date-time", example: "2026-12-31T00:00:00.000Z" },
    budget: { type: "number", example: 250000 },
    description: { type: "string", example: "Implantação de sistema ERP completo" },
    status: {
      type: "string",
      enum: ["analysis", "approved", "in_progress", "closed", "cancelled"],
      example: "analysis",
    },
    risk: { type: "string", enum: ["low", "medium", "high"], example: "medium" },
    aiAnalysis: {
      nullable: true,
      type: "object",
      properties: {
        summary: { type: "string" },
        attentionPoints: { type: "array", items: { type: "string" } },
        executiveRecommendation: { type: "string" },
      },
    },
    aiAnalyzedAt: { type: "string", format: "date-time", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export const createProjectBodySchema: SchemaObject = {
  type: "object",
  required: ["name", "startDate", "endDate", "budget", "description"],
  properties: {
    name: { type: "string", maxLength: 200, example: "Sistema ERP" },
    startDate: { type: "string", format: "date-time", example: "2026-01-01T00:00:00.000Z" },
    endDate: { type: "string", format: "date-time", example: "2026-12-31T00:00:00.000Z" },
    budget: { type: "number", minimum: 0, exclusiveMinimum: true, example: 250000 },
    description: { type: "string", example: "Implantação de sistema ERP completo" },
  },
};

export const updateProjectBodySchema: SchemaObject = {
  type: "object",
  properties: {
    name: { type: "string", maxLength: 200, example: "Sistema ERP — Fase 2" },
    startDate: { type: "string", format: "date-time", example: "2026-01-01T00:00:00.000Z" },
    endDate: { type: "string", format: "date-time", example: "2026-12-31T00:00:00.000Z" },
    budget: { type: "number", minimum: 0, exclusiveMinimum: true, example: 300000 },
    description: { type: "string", example: "Descrição atualizada do projeto" },
  },
};

export const updateStatusBodySchema: SchemaObject = {
  type: "object",
  required: ["status"],
  properties: {
    status: {
      type: "string",
      enum: ["analysis", "approved", "in_progress", "closed", "cancelled"],
      example: "approved",
    },
  },
};

export const aiAnalysisSchema: SchemaObject = {
  type: "object",
  properties: {
    summary: { type: "string", example: "Projeto de alto impacto com risco elevado devido ao orçamento acima de R$ 500k." },
    attentionPoints: {
      type: "array",
      items: { type: "string" },
      example: ["Prazo apertado para o escopo definido", "Orçamento próximo do limite de risco alto"],
    },
    executiveRecommendation: {
      type: "string",
      example: "Recomenda-se revisão do cronograma e reserva de contingência de 15%.",
    },
  },
};

export const errorSchema: SchemaObject = {
  type: "object",
  properties: {
    statusCode: { type: "number", example: 400 },
    message: { type: "string", example: "Mensagem de erro" },
    error: { type: "string", example: "Bad Request" },
  },
};
