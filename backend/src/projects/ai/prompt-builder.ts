import { Injectable } from "@nestjs/common";
import type { AiAnalysisInput } from "./ai.client";

@Injectable()
export class ProjectAnalysisPromptBuilder {
  build(input: AiAnalysisInput): string {
    const durationDays = Math.ceil(
      (input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return `You are a senior project management analyst. Analyze the following project and return a valid JSON object with exactly these keys: "summary" (string), "attentionPoints" (array of strings), and "executiveRecommendation" (string). Write all content in Brazilian Portuguese.

Project data:
- Name: ${input.name}
- Description: ${input.description}
- Current status: ${input.status}
- Risk level: ${input.risk}
- Total budget: R$ ${input.budget.toLocaleString("pt-BR")}
- Duration: ${durationDays} days (${input.startDate.toLocaleDateString("pt-BR")} to ${input.endDate.toLocaleDateString("pt-BR")})

Return ONLY the JSON object, no markdown fences, no extra text.`;
  }
}
