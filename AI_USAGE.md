# AI Usage Documentation

## Ferramentas de Desenvolvimento com IA

**Claude Code** (claude-sonnet-4-6) — CLI da Anthropic para desenvolvimento assistido por IA. Utilizado em todas as etapas do projeto: planejamento, design, implementação e revisão.

**Anthropic API** (claude-haiku-4-5-20251001) — Utilizado em tempo de execução para análise de projetos via `GET /projects/:id/ai-analysis`.

---

## Metodologia: Spec Driven Development

O projeto foi desenvolvido seguindo **Spec Driven Development (SDD)**, uma abordagem estruturada em que cada funcionalidade passa por três fases antes da implementação:

### 1. Brainstorming (`superpowers:brainstorming`)

Exploração colaborativa da ideia antes de qualquer código. O assistente faz perguntas uma por vez para entender propósito, restrições e critérios de sucesso, propõe 2–3 abordagens com trade-offs e apresenta o design em seções para aprovação incremental.

### 2. Escrita da Spec

Após aprovação do design, um documento de spec é salvo em `docs/specs/` com formato padronizado: objetivo, arquitetura, componentes, decisões e regras globais. A spec é o contrato que governa a implementação.

### 3. Plano de Implementação (`superpowers:writing-plans`)

A spec vira um plano de tarefas em `docs/plans/` com código completo em cada passo, caminhos exatos de arquivo, comandos para executar e resultados esperados. YAGNI e TDD são princípios guias.

### 4. Execução Subagente (`superpowers:subagent-driven-development`)

O plano é executado por subagentes especializados — um por tarefa — com revisão de spec compliance e qualidade de código após cada task. Findings Critical/Important são corrigidos antes de prosseguir; Minor são registrados no ledger para o review final.

---

## Skills Utilizadas no Projeto

| Skill                                        | Quando usada                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| `superpowers:using-superpowers`              | Carregada no início de cada sessão — define a ordem de verificação de skills |
| `superpowers:brainstorming`                  | Planejamento da integração Prisma + PostgreSQL                               |
| `superpowers:writing-plans`                  | Criação do plano de implementação Prisma                                     |
| `superpowers:subagent-driven-development`    | Execução do plano com subagentes por task e review loop                      |
| `superpowers:finishing-a-development-branch` | Conclusão e integração do branch de feature                                  |

---

## MCPs Configurados

Os MCP servers abaixo estão disponíveis no ambiente Claude Code. Os marcados como ✓ foram utilizados neste projeto.

| MCP        | Propósito                                           | Usado |
| ---------- | --------------------------------------------------- | ----- |
| `context7` | Documentação atualizada de bibliotecas e frameworks | ✓     |

---

## Como a IA foi usada em cada etapa

### Bootstrap e Stack

- Definição das ferramentas (Biome vs ESLint, Vitest vs Jest, pnpm vs npm)
- Configuração do `tsconfig.json` strict e `biome.json`
- Estrutura inicial de pastas seguindo Clean Architecture

### Domínio

- Modelagem da entidade `Project` com padrão de fábrica e acesso privado
- Lógica de cálculo de risco (maior entre orçamento e duração)
- Regra de transições de status como tabela de estados

### Use-Cases e Testes

- Implementação TDD: testes escritos antes do código de produção
- Uso de `InMemoryProjectsRepository` como double de teste (sem mocks)
- Cobertura de caminho feliz, not found e regras de negócio

### Módulo de IA

- Design do prompt estruturado para retorno JSON sem markdown fences
- Separação `IAiClient` (abstrato) / `AnthropicAiClient` (implementação) para testabilidade
- Tratamento de falha de parse do JSON retornado pelo modelo

### Camada HTTP

- DTOs em português com validação Zod e coerção de datas
- `ZodValidationPipe` genérico reutilizável
- `ProjectPresenter` com mapeamento inglês (domínio) → português (API)

### Persistência com Prisma

- Adaptação para Prisma 7 (nova API `prisma.config.ts`, WASM client com adapter)
- Mapeamento snake_case (DB) ↔ camelCase (domínio) isolado no repositório
- Seed usando entidade `Project` para garantir consistência das regras de negócio

---

## Código Revisado e Ajustado

- **Aceito:** estrutura de módulos, interfaces de repositório, casos de teste, wiring do DI
- **Ajustado:** cálculo de risco (regra "prevalece o maior"), convenção inglês/português, Prisma 7 API (Breaking change: `prisma.config.ts` + adapter para WASM client)
- **Descartado:** padrão Either/Result monad (complexidade desnecessária para o escopo)

---

## Feature de IA em Runtime

O endpoint `GET /projects/:id/ai-analysis` chama a Anthropic API (modelo Haiku) e retorna:

```json
{
  "summary": "...",
  "attentionPoints": ["...", "..."],
  "executiveRecommendation": "..."
}
```

O prompt é construído em inglês pelo `ProjectAnalysisPromptBuilder` e o modelo responde em português brasileiro.

---

## Documentação do Projeto

Toda a documentação gerada com IA está versionada em `docs/`:

```
docs/
  specs/     ← design specs de cada etapa (01 a 07)
  plans/     ← planos de implementação com código completo
```

---

## Limitações Conhecidas

- Sem paginação no endpoint de listagem de projetos
- Análise de IA requer `ANTHROPIC_API_KEY` configurada
- Sem camada de autenticação ou autorização
- `risk` armazenado no banco não tem constraint de enum — validação é feita pela entidade
