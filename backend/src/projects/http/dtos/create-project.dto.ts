import { z } from "zod";

export const createProjectSchema = z
  .object({
    nome: z.string().min(1, "nome is required").max(200),
    dataInicio: z.coerce.date({ error: "dataInicio is required" }),
    previsaoTermino: z.coerce.date({ error: "previsaoTermino is required" }),
    orcamentoTotal: z
      .number({ error: "orcamentoTotal is required" })
      .positive("orcamentoTotal must be positive"),
    descricao: z.string().min(1, "descricao is required"),
  })
  .refine((data) => data.previsaoTermino > data.dataInicio, {
    message: "previsaoTermino must be after dataInicio",
    path: ["previsaoTermino"],
  });

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
