import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";

import { type AiAnalysisInput, type AiAnalysisResult, IAiClient } from "./ai.client";
import type { ProjectAnalysisPromptBuilder } from "./prompt-builder";

@Injectable()
export class GeminiAiClient extends IAiClient {
  private readonly client: GoogleGenerativeAI;
  private readonly logger = new Logger(GeminiAiClient.name);

  constructor(private readonly promptBuilder: ProjectAnalysisPromptBuilder) {
    super();
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  }

  async analyze(input: AiAnalysisInput): Promise<AiAnalysisResult> {
    const prompt = this.promptBuilder.build(input);
    const model = this.client.getGenerativeModel({ model: "gemini-3.5-flash" });

    let text: string;
    try {
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (error) {
      if (error instanceof GoogleGenerativeAIFetchError && error.status === 429) {
        throw new ServiceUnavailableException(
          "Cota da API Gemini esgotada. Tente novamente em alguns minutos ou aguarde a renovação diária da cota.",
        );
      }
      this.logger.error("Gemini API request failed", error);
      throw new ServiceUnavailableException("Falha ao consultar a API Gemini.");
    }

    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as AiAnalysisResult;
    } catch {
      this.logger.error("Failed to parse Gemini response", text);
      throw new ServiceUnavailableException("A resposta da API Gemini veio em formato inesperado.");
    }
  }
}
