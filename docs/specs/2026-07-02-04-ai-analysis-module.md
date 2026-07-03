# Spec 04 — Módulo de Análise com IA

**Data:** 2026-07-02
**Commit:** a096a18
**Status:** Implementado

---

## Objetivo

Oferecer análise automática de projetos usando o modelo Claude da Anthropic, retornando um JSON estruturado com sumário, pontos de atenção e recomendação executiva.

---

## Componentes

### `IAiClient` (classe abstrata)
**Arquivo:** `src/projects/ai/ai.client.ts`

Contrato do cliente de IA — permite trocar de provider sem alterar use-cases.

```typescript
abstract class IAiClient {
  abstract analyze(input: AiAnalysisInput): Promise<AiAnalysisResult>
}
```

**Tipos:**
```typescript
interface AiAnalysisInput {
  name: string; description: string; status: string;
  risk: string; budget: number; startDate: Date; endDate: Date;
}
interface AiAnalysisResult {
  summary: string;
  attentionPoints: string[];
  executiveRecommendation: string;
}
```

### `AnthropicAiClient`
**Arquivo:** `src/projects/ai/anthropic-ai.client.ts`

Implementação do `IAiClient` usando o SDK oficial da Anthropic.

- Modelo: `claude-haiku-4-5-20251001`
- `max_tokens`: 1024
- API key via `process.env.ANTHROPIC_API_KEY`
- Faz parse do JSON retornado pelo modelo; lança erro se não for JSON válido

### `ProjectAnalysisPromptBuilder`
**Arquivo:** `src/projects/ai/prompt-builder.ts`

Constrói o prompt em inglês com os dados do projeto (nome, descrição, status, risco, orçamento, duração em dias). Instrui o modelo a responder **em português brasileiro** com um JSON exato sem markdown fences.

### `AiAnalysisService`
**Arquivo:** `src/projects/ai/ai-analysis.service.ts`

Orquestra `IAiClient` + `ProjectAnalysisPromptBuilder`. Ponto de entrada para o `GetAiAnalysisUseCase`.

---

## Fluxo

```
GetAiAnalysisUseCase
  → busca Project no repositório
  → monta AiAnalysisInput
  → AiAnalysisService.analyze(input)
      → ProjectAnalysisPromptBuilder.build(input)
      → AnthropicAiClient.analyze(input, prompt)
          → Anthropic API (claude-haiku)
      → JSON.parse(response)
  → retorna AiAnalysisResult
```

---

## Decisões

**Por que classe abstrata em vez de interface TypeScript para `IAiClient`?**
O sistema de DI do NestJS precisa de um token de injeção em runtime. Interfaces TypeScript são apagadas na transpilação; classes abstratas persistem como valor e podem ser usadas como token.

**Por que `ANTHROPIC_API_KEY` é opcional na env?**
Para permitir subir o app e rodar os testes sem a chave. O endpoint de análise falhará em runtime se a chave não estiver configurada, mas os demais endpoints funcionam normalmente.

---

## Variável de Ambiente

```
ANTHROPIC_API_KEY=sk-ant-...  # necessário apenas para usar GET /projects/:id/ai-analysis
```
