import { z } from "zod";

export const updateProjectSchema = z
  .object({
    nome: z.string().min(1).max(200).optional(),
    dataInicio: z.coerce.date().optional(),
    previsaoTermino: z.coerce.date().optional(),
    orcamentoTotal: z.number().positive().optional(),
    descricao: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.dataInicio && data.previsaoTermino) {
        return data.previsaoTermino > data.dataInicio;
      }
      return true;
    },
    {
      message: "previsaoTermino must be after dataInicio",
      path: ["previsaoTermino"],
    },
  );

export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
