import { GoogleGenerativeAI } from "@google/generative-ai";
import { Injectable, Logger } from "@nestjs/common";
import { type AiAnalysisInput, type AiAnalysisResult, IAiClient } from "./ai.client";
import { ProjectAnalysisPromptBuilder } from "./prompt-builder";

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
    const model = this.client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as AiAnalysisResult;
    } catch {
      this.logger.error("Failed to parse Gemini response", text);
      throw new Error("Failed to process AI response");
    }
  }
}
