import { z } from "zod";

export const updateProjectSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  dataInicio: z.coerce.date().optional(),
  previsaoTermino: z.coerce.date().optional(),
  orcamentoTotal: z.number().positive().optional(),
  descricao: z.string().min(1).optional(),
});

export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
