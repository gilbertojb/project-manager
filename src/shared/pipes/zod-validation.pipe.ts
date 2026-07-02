import { PipeTransform, BadRequestException } from "@nestjs/common";
import { z } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: z.flattenError(result.error),
      });
    }
    return result.data;
  }
}
