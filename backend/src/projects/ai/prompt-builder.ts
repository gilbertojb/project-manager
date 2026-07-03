import { Injectable } from "@nestjs/common";
import type { AiAnalysisInput } from "./ai.client";

@Injectable()
export class ProjectAnalysisPromptBuilder {
  build(input: AiAnalysisInput): string {
    const durationDays = Math.ceil(
      (input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return `You are a senior project management analyst. Analyze the project below and respond with a single valid JSON object containing exactly these three keys:

- "summary": a concise paragraph summarizing the project context, current status and risk level (string)
- "attentionPoints": a list of 2 to 4 specific risks or concerns that deserve attention (array of strings)
- "executiveRecommendation": one clear, actionable recommendation addressed to the project sponsor (string)

Write all values in Brazilian Portuguese. Return ONLY the JSON object — no markdown fences, no extra text, no explanation outside the JSON.

Project data:
- Name: ${input.name}
- Description: ${input.description}
- Current status: ${input.status}
- Risk level: ${input.risk}
- Total budget: R$ ${input.budget.toLocaleString("pt-BR")}
- Duration: ${durationDays} days (${input.startDate.toLocaleDateString("pt-BR")} to ${input.endDate.toLocaleDateString("pt-BR")})

Expected output format:
{"summary":"...","attentionPoints":["...","..."],"executiveRecommendation":"..."}`;
  }
}
