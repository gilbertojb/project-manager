# AI Usage Documentation

## Ferramentas e Modelos Utilizados

| Ferramenta | Modelo | Propósito |
|------------|--------|-----------|
| **Claude Code** | claude-sonnet-4-6 | Assistente de desenvolvimento no terminal — planejamento, geração e revisão de código |
| **Anthropic API** | claude-haiku-4-5-20251001 | Chamada em runtime para o endpoint `GET /projects/:id/ai-analysis` |

---

## Para Quais Partes do Desafio a IA foi Utilizada

| Área | O que a IA ajudou a fazer |
|------|---------------------------|
| Arquitetura | Definir a separação em camadas (domain, use-cases, http, persistence, ai) |
| Entidade de domínio | Estrutura da classe `Project` com padrão de fábrica e acesso privado |
| Cálculo de risco | Implementação da lógica com "prevalece o maior risco" |
| Transições de status | Tabela `STATUS_TRANSITIONS` e validação no `transitionTo` |
| Módulo de IA | Estrutura `IAiClient` / `AnthropicAiClient` / `ProjectAnalysisPromptBuilder` |
| Configuração Prisma 7 | Adaptação para a nova API com `prisma.config.ts` e WASM adapter |
| Testes | Escrita dos specs com `InMemoryProjectsRepository` como double real |
| Swagger | Decoradores `@ApiOperation` e `@ApiResponse` no controller |

---

## Principais Prompts Utilizados

### Design da entidade de domínio

> "Preciso modelar uma entidade `Project` em TypeScript com Clean Architecture. Os campos são: id, name, startDate, endDate, budget, description, status e risk. O status inicial deve ser sempre `analysis` e o risco deve ser calculado automaticamente com base no orçamento e no prazo. Me sugira uma estrutura com construtor privado e factory method."

A IA propôs o padrão `Project.create()` + `Project.restore()`, que eu adotei. O getter `data` foi ideia minha para facilitar a cópia defensiva ao persistir.

### Regra de cálculo de risco

> "Implemente o método `calculateRisk` com as seguintes regras: baixo (orçamento ≤ 100k e prazo ≤ 3 meses), médio (orçamento entre 100k e 500k ou prazo entre 3 e 6 meses), alto (orçamento > 500k ou prazo > 6 meses). Quando mais de uma regra se aplicar, prevalece o maior risco."

A IA gerou a lógica com `Math.max` sobre o array ordenado `[LOW, MEDIUM, HIGH]`. Validei o comportamento nos testes antes de aceitar.

### Separação da camada de IA

> "Quero um serviço de análise de IA em NestJS que não exponha a chamada diretamente no controller. Me sugira a separação mínima de responsabilidades para manter testabilidade."

A IA propôs `IAiClient` (classe abstrata) + `AnthropicAiClient` (implementação) + `AiAnalysisService` (orquestra) + `ProjectAnalysisPromptBuilder` (constrói o prompt). Adotei essa estrutura integralmente — ela é bem justificada pelo princípio de inversão de dependência.

### Prompt enviado à API Anthropic em runtime

> "You are a senior project management analyst. Analyze the following project and return a valid JSON object with exactly these keys: 'summary' (string), 'attentionPoints' (array of strings), and 'executiveRecommendation' (string). Write all content in Brazilian Portuguese. [...] Return ONLY the JSON object, no markdown fences, no extra text."

Escrevi este prompt por conta própria após testar que o modelo tendia a envolver o JSON em blocos de código markdown. A instrução "no markdown fences" e a especificação exata das chaves foi necessária para tornar o parse confiável.

### Configuração do Prisma 7

> "Estou usando Prisma 7. Como configuro o cliente com `prisma.config.ts` em vez do `url = env()` no schema? O projeto usa PostgreSQL e preciso que o seed use a entidade `Project` em vez de inserir dados brutos."

A IA identificou as breaking changes do Prisma 7 (nova API de config, WASM client com adapter) e gerou o `prisma.config.ts`. Ajustei o seed manualmente para usar `Project.create()` em vez de `prisma.project.create()` direto, garantindo que as regras de negócio fossem respeitadas.

---

## O que foi Aceito, Ajustado ou Descartado

### Aceito sem modificação
- Estrutura de pastas em Clean Architecture (domain / use-cases / http / persistence / ai)
- Padrão `Project.create()` + `Project.restore()` (factory + reconstituição)
- `InMemoryProjectsRepository` como double real de testes (sem mocks de framework)
- Separação `IAiClient` / `AnthropicAiClient` / `AiAnalysisService`
- `ZodValidationPipe` genérico e reutilizável
- Tabela `STATUS_TRANSITIONS` como `Record<ProjectStatus, ProjectStatus[]>`

### Ajustado após revisão
- **Cálculo de risco:** a IA gerou inicialmente com `if/else` encadeado. Reescrevi usando arrays ordenados e `Math.max` para ficar mais declarativo e fácil de estender.
- **Prompt de análise:** versão inicial da IA retornava markdown fences ao redor do JSON. Adicionei instrução explícita "no markdown fences" e tratamento de erro no parse.
- **Seed:** gerado com `prisma.project.createMany()` diretamente. Reescrevi usando `Project.create()` para que as regras de negócio (risco calculado, status inicial) fossem aplicadas consistentemente.
- **`prisma.config.ts`:** a IA não conhecia a API exata do Prisma 7 e gerou código com a API do Prisma 5. Corrigi com base na documentação oficial.

### Descartado
- **Padrão Either/Result monad:** a IA sugeriu para tratamento de erros nos use-cases. Descartei por adicionar complexidade desnecessária ao escopo do desafio — exceções HTTP do NestJS são suficientes.
- **Campos da API em português:** a IA sugeriu nomear os campos da resposta HTTP em português (`nomeDoProejto`, `dataInicio` etc.). Mantive inglês no domínio e na API (`name`, `startDate`) para maior consistência com convenções REST e facilidade de consumo pelo frontend.

---

## Decisões Técnicas Tomadas pelo Candidato

Estas decisões foram minhas, sem sugestão direta da IA:

1. **Vitest em vez de Jest** — pela integração nativa com TypeScript e velocidade superior em projetos com ESM.
2. **Biome em vez de ESLint + Prettier** — ferramenta única para lint e formatação, configuração mínima.
3. **Zod em vez de `class-validator`** — validação type-safe sem decoradores, melhor integração com TypeScript estrito.
4. **Campos da API em inglês** — contrariamente à sugestão da IA, mantive inglês na API para consistência REST padrão.
5. **`risk` não persistido como constraint de enum no banco** — a validação é feita pela entidade; no banco é `text` para manter flexibilidade sem migrations a cada mudança de regra.
6. **Prompt de análise escrito em inglês com resposta em PT-BR** — modelos de linguagem tendem a ter raciocínio de melhor qualidade em inglês; a instrução de responder em português fica no prompt.
7. **`CLOSED → CANCELLED` permitido** — o spec diz "qualquer status → cancelado", então incluí `CLOSED` nas transições possíveis, mesmo que o caso de uso seja raro na prática.

---

## Limitações Conhecidas

- Sem paginação no endpoint de listagem (`GET /projects` retorna todos os registros)
- Análise de IA requer `ANTHROPIC_API_KEY` configurada; sem ela o endpoint retorna erro 500
- Sem cache das análises — cada chamada ao endpoint gera uma nova requisição à API Anthropic
- Sem autenticação ou autorização
- `risk` armazenado no banco como `text` sem constraint de enum — valores inválidos só são rejeitados pela entidade na escrita
- Frontend não implementado nesta entrega
