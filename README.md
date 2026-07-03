# Project Manager

API REST para gerenciamento simplificado de projetos com análise de risco automática e análise executiva via IA.

## Stack

- **Backend:** Node.js 20 · NestJS 11 · TypeScript (strict)
- **Banco de dados:** PostgreSQL via Prisma 7
- **Validação:** Zod
- **Testes:** Vitest
- **Lint/formato:** Biome
- **IA em runtime:** Anthropic API (Claude Haiku)

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker e Docker Compose

## Setup

### 1. Instalar dependências

```bash
cd backend
pnpm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e preencha `DATABASE_URL` e as variáveis do provider de IA escolhido:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_manager

# Escolha o provider: anthropic | gemini | openai  (padrão: anthropic)
AI_PROVIDER=gemini

# Preencha apenas a chave do provider escolhido
ANTHROPIC_API_KEY=sk-ant-...   # anthropic.com
GEMINI_API_KEY=AIza...         # aistudio.google.com (tier gratuito disponível)
OPENAI_API_KEY=sk-...          # platform.openai.com (requer créditos)
```

### 3. Subir o banco de dados

```bash
docker compose up -d
```

### 4. Aplicar migrations e seed

```bash
pnpm run db:migrate   # cria as tabelas
pnpm run db:seed      # insere 5 projetos de exemplo
```

### 5. Iniciar o servidor

```bash
pnpm run start:dev
```

A API estará disponível em `http://localhost:3000`.  
A documentação Swagger estará em `http://localhost:3000/docs`.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/projects` | Criar projeto |
| `GET` | `/projects` | Listar projetos |
| `GET` | `/projects/:id` | Buscar projeto por ID |
| `PATCH` | `/projects/:id` | Atualizar campos do projeto |
| `DELETE` | `/projects/:id` | Remover projeto |
| `PATCH` | `/projects/:id/status` | Alterar status do projeto |
| `GET` | `/projects/:id/ai-analysis` | Gerar análise executiva com IA |

## Regras de Negócio

### Status

Todo projeto é criado com status `analysis`. As transições permitidas são:

```
analysis → approved → in_progress → closed
qualquer status → cancelled
```

Projetos com status `in_progress` ou `closed` não podem ser excluídos.

### Risco calculado automaticamente

| Nível | Critério |
|-------|----------|
| `low` | Orçamento ≤ R$ 100.000 **e** prazo ≤ 3 meses |
| `medium` | Orçamento entre R$ 100.001 e R$ 500.000 **ou** prazo entre 3 e 6 meses |
| `high` | Orçamento > R$ 500.000 **ou** prazo > 6 meses |

Quando mais de uma regra se aplica, prevalece o maior risco.  
O risco é recalculado automaticamente ao criar ou atualizar o projeto.

### Análise com IA

O endpoint `GET /projects/:id/ai-analysis` chama a Anthropic API (Claude Haiku) e retorna:

```json
{
  "summary": "...",
  "attentionPoints": ["...", "..."],
  "executiveRecommendation": "..."
}
```

Requer `ANTHROPIC_API_KEY` configurada no `.env`.

## Testes

```bash
pnpm run test:unit
```

## Outros comandos

```bash
pnpm run build        # compilar TypeScript
pnpm run lint         # checar lint com Biome
pnpm run format       # formatar com Biome
pnpm run db:studio    # abrir Prisma Studio
```
