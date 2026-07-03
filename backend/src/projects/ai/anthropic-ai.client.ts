import Anthropic from "@anthropic-ai/sdk";
import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";

import { type AiAnalysisInput, type AiAnalysisResult, IAiClient } from "./ai.client";
import type { ProjectAnalysisPromptBuilder } from "./prompt-builder";

@Injectable()
export class AnthropicAiClient extends IAiClient {
  private readonly client: Anthropic;
  private readonly logger = new Logger(AnthropicAiClient.name);

  constructor(private readonly promptBuilder: ProjectAnalysisPromptBuilder) {
    super();
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async analyze(input: AiAnalysisInput): Promise<AiAnalysisResult> {
    const prompt = this.promptBuilder.build(input);

    let message: Anthropic.Message;
    try {
      message = await this.client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        throw new ServiceUnavailableException(
          "Cota da API Anthropic esgotada. Tente novamente em alguns instantes.",
        );
      }
      this.logger.error("Anthropic API request failed", error);
      throw new ServiceUnavailableException("Falha ao consultar a API Anthropic.");
    }

    const content = message.content[0];
    if (content.type !== "text") {
      throw new ServiceUnavailableException("A resposta da API Anthropic veio em formato inesperado.");
    }

    try {
      return JSON.parse(content.text) as AiAnalysisResult;
    } catch {
      this.logger.error("Failed to parse Anthropic response", content.text);
      throw new ServiceUnavailableException("A resposta da API Anthropic veio em formato inesperado.");
    }
  }
}
