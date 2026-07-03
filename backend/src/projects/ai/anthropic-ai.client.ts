import { Injectable, Logger } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";
import { IAiClient, type AiAnalysisInput, type AiAnalysisResult } from "./ai.client";
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

    const message = await this.client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected AI response type");
    }

    try {
      return JSON.parse(content.text) as AiAnalysisResult;
    } catch {
      this.logger.error("Failed to parse AI response", content.text);
      throw new Error("Failed to process AI response");
    }
  }
}
