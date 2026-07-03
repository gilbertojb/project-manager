import { z } from "zod";
import { ProjectStatus } from "../../domain/project.types";

export const updateStatusSchema = z.object({
  status: z.enum(ProjectStatus, {
    error: `status must be one of: ${Object.values(ProjectStatus).join(", ")}`,
  }),
});

export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
