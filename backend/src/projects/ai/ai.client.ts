export interface AiAnalysisInput {
  name: string;
  description: string;
  status: string;
  risk: string;
  budget: number;
  startDate: Date;
  endDate: Date;
}

export interface AiAnalysisResult {
  summary: string;
  attentionPoints: string[];
  executiveRecommendation: string;
}

export abstract class IAiClient {
  abstract analyze(input: AiAnalysisInput): Promise<AiAnalysisResult>;
}
