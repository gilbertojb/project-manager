import { z } from "zod";

export const updateProjectSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    budget: z.number().positive().optional(),
    description: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "endDate must be after startDate",
      path: ["endDate"],
    },
  );

export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
