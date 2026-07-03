# AI Usage Documentation

## Ferramentas e Modelos

| Ferramenta | Modelo | Propósito |
|------------|--------|-----------|
| **Claude Code** | claude-sonnet-4-6 | Assistente de desenvolvimento no terminal — execução de tarefas sob especificação do desenvolvedor |
| **Anthropic API** | claude-haiku-4-5-20251001 | Provider de análise executiva em runtime (`GET /projects/:id/ai-analysis`) |
| **Google Generative AI** | gemini-3.5-flash | Provider alternativo de análise executiva em runtime |
| **OpenAI API** | gpt-4o-mini | Provider alternativo de análise executiva em runtime |

---

## Decisões Técnicas do Desenvolvedor

Todas as decisões de arquitetura, stack e design foram tomadas pelo desenvolvedor antes ou durante a interação com a IA. A IA atuou como executor, não como arquiteto.

### Stack e Ferramentas

| Decisão | Escolha | Alternativa recusada | Motivo |
|---------|---------|----------------------|--------|
| Testes | Vitest | Jest | Integração nativa com TypeScript/ESM e execução mais rápida |
| Lint + formato | Biome | ESLint + Prettier | Ferramenta única, configuração mínima, sem conflitos |
| Validação | Zod | `class-validator` | Type-safe sem decoradores; melhor integração com TypeScript estrito |
| Provider de IA (runtime) | Multi-provider plugável | Acoplado ao Anthropic | Permite trocar o modelo sem alterar lógica de negócio |
| Campos da API | Inglês no domínio, português na camada HTTP | Português em todo o stack | Consistência REST padrão no domínio; nomes PT-BR acessíveis no DTO |
| `risk` no banco | `text` sem enum constraint | Enum no schema | Regra de negócio pertence à entidade; banco não deve precisar de migration a cada mudança de critério |

### Arquitetura

- **Clean Architecture em 3 camadas** (`domain` / `use-cases` / `http` + `persistence`) — definida antes de qualquer geração de código
- **Entidade como autoridade de negócio** — `risk` é calculado dentro da classe `Project`, nunca no use-case ou repositório; status segue tabela `STATUS_TRANSITIONS` validada na própria entidade
- **Factory methods `Project.create()` + `Project.restore()`** — separação explícita entre criação de novo projeto (com cálculo de risco e status inicial) e reconstituição a partir da persistência
- **`IAiClient` como abstração** — classe abstrata com `AnthropicAiClient`, `GeminiAiClient` e `OpenAiClient` como implementações; o `ProjectsModule` seleciona o provider via `AI_PROVIDER` sem acoplar o serviço a nenhuma SDK
- **Seed com entidade, não com ORM** — `Project.create()` é chamado no seed para garantir que as regras de risco e status inicial sejam aplicadas, em vez de inserir dados brutos via `prisma.project.createMany()`
- **`InMemoryProjectsRepository` como double real** — implementação concreta da interface usada nos testes de use-cases; sem mocks de framework, sem vazamento de detalhe de infraestrutura nos testes
- **Prompt de análise em inglês com resposta em PT-BR** — modelos de linguagem têm raciocínio mais preciso em inglês; a instrução de idioma fica no prompt, não no código

### Frontend

- **TailwindCSS v4** com plugin Vite (`@tailwindcss/vite`) — sem `tailwind.config.js` nem `postcss.config.js`, que são padrões da v3
- **shadcn/ui new-york com oklch** — CSS variables com gamut ampliado para fidelidade de cor nos temas dark/light
- **react-hook-form + Zod** — mesma biblioteca de validação do backend, esquemas reutilizáveis
- **`@tanstack/react-query`** para server state — sem Redux ou Zustand; mutations invalidam queries automaticamente
- **`canCancelProject` e `NEXT_STATUS`** como funções puras em `types/project.ts` — lógica de transição de status replicada no frontend para habilitar/desabilitar ações na UI sem round-trip ao backend

---

## Como a IA foi Utilizada

### Backend

A IA foi usada para gerar código com base em especificações detalhadas fornecidas pelo desenvolvedor. Em nenhum caso a IA definiu a arquitetura ou as regras de negócio.

| Área | Como a IA foi utilizada |
|------|------------------------|
| Entidade de domínio | Geração da estrutura `Project` conforme especificação de campos, factory methods e método `calculateRisk` |
| Cálculo de risco | Implementação da lógica com critérios e precedência definidos previamente pelo desenvolvedor |
| Transições de status | Geração da tabela `STATUS_TRANSITIONS` e do método `transitionTo` a partir das regras especificadas |
| Módulo de IA | Geração dos três clientes (`AnthropicAiClient`, `GeminiAiClient`, `OpenAiClient`) com a interface `IAiClient` já desenhada |
| Configuração Prisma 7 | Adaptação para a nova API (`prisma.config.ts`, WASM adapter) após o desenvolvedor identificar breaking changes |
| Testes | Geração dos specs com `InMemoryProjectsRepository` conforme o padrão definido pelo desenvolvedor |
| Swagger | Adição de decoradores `@ApiOperation` e `@ApiResponse` no controller existente |

### Frontend

A IA executou a geração de boilerplate e componentes conforme layout, estrutura de props e comportamento especificados pelo desenvolvedor.

| Área | Como a IA foi utilizada |
|------|------------------------|
| Scaffold | Geração de `package.json`, `tsconfig.json`, `vite.config.ts` com a stack já decidida |
| CSS vars / tema | Geração das variáveis oklch para temas light e dark conforme o design system definido |
| Componentes | `ProjectCard`, `ProjectFormDialog`, `ProjectRiskBadge`, `ProjectStatusBadge` gerados sob especificação de layout e comportamento |
| Páginas | `ProjectsPage` (grid de cards) e `ProjectDetailPage` (detalhe + ações de status + análise IA) com fluxo definido pelo desenvolvedor |
| Integração API | Funções em `api/projects.ts` mapeando os endpoints da API e o hook de análise IA com estado de loading |

---

## O que foi Aceito, Ajustado ou Descartado

### Aceito sem modificação

- Padrão `Project.create()` + `Project.restore()` (factory + reconstituição)
- `InMemoryProjectsRepository` como double real de testes
- Separação `IAiClient` / `*AiClient` / `AiAnalysisService` / `ProjectAnalysisPromptBuilder`
- `ZodValidationPipe` genérico e reutilizável
- `STATUS_TRANSITIONS` como `Record<ProjectStatus, ProjectStatus[]>`

### Ajustado após revisão

- **Cálculo de risco:** versão inicial gerada com `if/else` encadeado. Reescrito com arrays ordenados e índice de prioridade para ficar declarativo e extensível.
- **Prompt de análise:** versão inicial retornava markdown fences ao redor do JSON. Adicionada instrução explícita e tratamento de parse com fallback de erro explícito.
- **Seed:** gerado originalmente com `prisma.project.createMany()`. Reescrito usando `Project.create()` para respeitar as regras de negócio.
- **`prisma.config.ts`:** a IA gerou código com a API do Prisma 5. Corrigido com base na documentação oficial do Prisma 7.

### Descartado

- **Either/Result monad nos use-cases:** sugestão da IA para tratamento de erros. Descartado por adicionar complexidade desnecessária ao escopo — exceções HTTP do NestJS são suficientes.
- **Campos da API em português no domínio:** sugestão da IA (`nomeDoProejto`, `dataInicio`). Mantido inglês no domínio e na API por consistência REST padrão.

---

## Limitações Conhecidas

- Sem paginação no `GET /projects` — retorna todos os registros
- Análise de IA sem cache — cada chamada ao endpoint gera nova requisição ao provider
- Sem autenticação ou autorização
- `risk` armazenado como `text` no banco, sem constraint de enum — validação feita exclusivamente pela entidade na escrita
