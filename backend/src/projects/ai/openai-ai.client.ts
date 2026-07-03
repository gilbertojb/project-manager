import OpenAI from "openai";
import { Injectable, Logger } from "@nestjs/common";
import { type AiAnalysisInput, type AiAnalysisResult, IAiClient } from "./ai.client";
import { ProjectAnalysisPromptBuilder } from "./prompt-builder";

@Injectable()
export class OpenAiClient extends IAiClient {
  private readonly client: OpenAI;
  private readonly logger = new Logger(OpenAiClient.name);

  constructor(private readonly promptBuilder: ProjectAnalysisPromptBuilder) {
    super();
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async analyze(input: AiAnalysisInput): Promise<AiAnalysisResult> {
    const prompt = this.promptBuilder.build(input);

    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("Empty response from OpenAI");
    }

    try {
      return JSON.parse(text) as AiAnalysisResult;
    } catch {
      this.logger.error("Failed to parse OpenAI response", text);
      throw new Error("Failed to process AI response");
    }
  }
}
