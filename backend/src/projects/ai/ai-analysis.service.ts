import { Injectable } from "@nestjs/common";
import type { IAiClient, AiAnalysisInput, AiAnalysisResult } from "./ai.client";

@Injectable()
export class AiAnalysisService {
  constructor(private readonly aiClient: IAiClient) {}

  async analyze(input: AiAnalysisInput): Promise<AiAnalysisResult> {
    return this.aiClient.analyze(input);
  }
}
