import { z } from "zod";

export const createProjectSchema = z
  .object({
    name: z.string().min(1, "name is required").max(200),
    startDate: z.coerce.date({ error: "startDate is required" }),
    endDate: z.coerce.date({ error: "endDate is required" }),
    budget: z
      .number({ error: "budget is required" })
      .positive("budget must be positive"),
    description: z.string().min(1, "description is required"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
