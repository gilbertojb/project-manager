# Spec 09 — Frontend: Área de Gestão de Projetos

**Data:** 2026-07-03
**Status:** Aprovada

---

## Contexto

O backend está 100% implementado com todos os endpoints REST, regras de negócio, cálculo de risco automático e análise de IA (Anthropic/OpenAI/Gemini). O frontend está no bootstrap: providers configurados, layout vazio e hello world. Esta spec cobre a implementação completa da área de gestão de projetos no frontend.

---

## Stack

- React 19 + Vite 6 + TypeScript strict
- TailwindCSS v4 (plugin Vite, sem tailwind.config.js)
- shadcn/ui (new-york, zinc, CSS vars oklch)
- react-router-dom v7
- @tanstack/react-query v5
- axios (instância configurada em `src/lib/axios.ts`)
- react-hook-form + zod v4
- sonner (toasts)

---

## Estrutura de Arquivos

```
src/
  api/
    projects.ts                    ← todas as funções de chamada à API (tipadas)
  components/
    ui/                            ← componentes shadcn/ui instalados via CLI
    projects/
      project-card.tsx             ← card individual de projeto
      project-form.tsx             ← formulário create/edit (RHF + zod)
      project-form-dialog.tsx      ← Dialog wrapper do formulário
      project-status-badge.tsx     ← badge com cor semântica por status
      project-risk-badge.tsx       ← badge com cor semântica por risco
  pages/
    _layouts/
      app.tsx                      ← layout com header + <Outlet />
    app/
      projects/
        projects.tsx               ← página de listagem (/projects)
      project-detail/
        project-detail.tsx         ← página de detalhe (/projects/:id)
  types/
    project.ts                     ← tipos, interfaces e enums do domínio
```

---

## Rotas

| Path | Componente | Descrição |
|---|---|---|
| `/` | redirect | Redireciona para `/projects` |
| `/projects` | `projects.tsx` | Listagem de projetos em grid de cards |
| `/projects/:id` | `project-detail.tsx` | Detalhe completo + análise de IA |

---

## Tipos (`src/types/project.ts`)

Os valores de status e risco são strings lowercase em inglês, conforme o backend retorna (ver `project.types.ts`).

```ts
export type ProjectStatus =
  | 'analysis'
  | 'approved'
  | 'in_progress'
  | 'closed'
  | 'cancelled'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface Project {
  id: string
  name: string
  startDate: string        // ISO 8601
  endDate: string          // ISO 8601
  budget: number
  description: string
  status: ProjectStatus
  risk: RiskLevel
  createdAt: string        // ISO 8601
  updatedAt: string        // ISO 8601
}

export interface AiAnalysis {
  summary: string
  attentionPoints: string[]
  executiveRecommendation: string
}

export interface CreateProjectData {
  name: string
  startDate: string
  endDate: string
  budget: number
  description: string
}

export type UpdateProjectData = Partial<CreateProjectData>
```

---

## Camada de API (`src/api/projects.ts`)

Uma função por endpoint, todas tipadas com os tipos de `src/types/project.ts`:

```ts
listProjects(): Promise<Project[]>
getProject(id: string): Promise<Project>
createProject(data: CreateProjectData): Promise<Project>
updateProject(id: string, data: UpdateProjectData): Promise<Project>
deleteProject(id: string): Promise<void>
updateProjectStatus(id: string, status: ProjectStatus): Promise<Project>
getAiAnalysis(id: string): Promise<AiAnalysis>
```

Usar a instância axios de `src/lib/axios.ts`. Nenhuma lógica de UI nesta camada.

---

## Gerenciamento de Estado com React Query

### Query Keys

| Query Key | Usado em |
|---|---|
| `['projects']` | Listagem |
| `['projects', id]` | Detalhe |
| `['projects', id, 'ai-analysis']` | Análise IA |

### Invalidação por Mutation

- `createProject` → invalida `['projects']`
- `updateProject` → invalida `['projects']` e `['projects', id]`
- `deleteProject` → invalida `['projects']`
- `updateProjectStatus` → invalida `['projects']` e `['projects', id]`

### Análise de IA

Usar `enabled: false` na query — só dispara quando o usuário clica em "Gerar Análise" via `refetch()`. Não autocarregar ao montar a página.

---

## Componentes

### `project-card.tsx`

Props: `project: Project`, `onEdit: (project: Project) => void`, `onDelete: (id: string) => void`.

Exibe: nome, `ProjectStatusBadge`, `ProjectRiskBadge`, orçamento formatado (BRL), data de início, previsão de término. Footer com botão "Ver detalhes" (link para `/projects/:id`) e `DropdownMenu` com ações Editar e Excluir.

Regra de UI: opção "Excluir" oculta quando `status === 'in_progress' || status === 'closed'`.

### `project-form.tsx`

Props: `defaultValues?: UpdateProjectData`, `onSubmit: (data: CreateProjectData) => Promise<void>`, `isSubmitting: boolean`.

Campos: Nome (text), Data de início (date), Previsão de término (date), Orçamento total (number, formato BRL), Descrição (textarea).

Validação Zod:
- `name`: string, min 3 chars
- `startDate`: date válida
- `endDate`: date válida, posterior a `startDate`
- `budget`: number, positivo, > 0
- `description`: string, min 10 chars

Mensagens de erro em pt-br. Botão de submit desabilitado durante `isSubmitting`.

### `project-form-dialog.tsx`

Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `project?: Project` (se presente → modo edição).

Título do Dialog muda: "Novo Projeto" vs "Editar Projeto". Ao submeter com sucesso, fecha o dialog e exibe toast de confirmação via sonner.

### `project-status-badge.tsx`

Props: `status: ProjectStatus`.

Mapeamento de cores:

| Status | Variante Badge | Label |
|---|---|---|
| analysis | secondary (zinc) | Em análise |
| approved | outline azul | Aprovado |
| in_progress | amarelo | Em andamento |
| closed | verde | Encerrado |
| cancelled | destructive (vermelho) | Cancelado |

### `project-risk-badge.tsx`

Props: `risk: RiskLevel`.

| Risco | Cor | Label |
|---|---|---|
| low | verde | Baixo |
| medium | amarelo | Médio |
| high | vermelho | Alto |

---

## Página de Listagem (`/projects`)

Layout:
- Header da página: título "Projetos" + botão "Novo Projeto" (abre `ProjectFormDialog`)
- Grid responsivo: 1 col (mobile) → 2 cols (md) → 3 cols (lg)
- Loading: 6 `Skeleton` com altura de card
- Estado vazio: ícone + "Nenhum projeto cadastrado" + botão "Criar primeiro projeto"
- Erro: mensagem inline com botão "Tentar novamente"

---

## Página de Detalhe (`/projects/:id`)

Layout (scroll vertical):

1. **Navegação:** botão "← Voltar" que volta para `/projects`
2. **Header:** nome do projeto + `ProjectStatusBadge` + `ProjectRiskBadge`
3. **Dados:** descrição, orçamento, data de início, previsão de término (grid 2 colunas)
4. **Ações:**
   - Botão "Avançar Status" → label dinâmica por status atual (oculto quando não há próximo passo no pipeline):
     - `analysis` → "Aprovar projeto"
     - `approved` → "Iniciar projeto"
     - `in_progress` → "Encerrar projeto"
     - `closed` / `cancelled` → botão oculto
   - Botão "Cancelar projeto" → visível quando `cancelled` é uma transição válida: `analysis`, `approved`, `in_progress`, `closed`. Oculto quando já `cancelled`.
   - Botão "Editar" → abre `ProjectFormDialog` em modo edição
5. **Seção "Análise com IA":**
   - Botão "Gerar análise"
   - Loading: spinner + "Gerando análise..."
   - Resultado: três sub-seções com título e conteúdo:
     - Resumo
     - Pontos de atenção (lista)
     - Recomendação executiva
   - Erro: mensagem + botão "Tentar novamente"

Loading da página: skeleton da estrutura inteira. Erro 404: redirect para `/projects`.

---

## AppLayout (`src/pages/_layouts/app.tsx`)

Header fixo com:
- À esquerda: nome da aplicação "Gestão de Projetos"
- À direita: toggle de tema (dark/light) usando o `useTheme` já existente

`<Outlet />` abaixo do header com padding padrão.

---

## Formulário — Schema Zod

```ts
const projectSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  startDate: z.string().min(1, 'Data de início obrigatória'),
  endDate: z.string().min(1, 'Previsão de término obrigatória'),
  budget: z.coerce.number().positive('Orçamento deve ser positivo'),
  description: z.string().min(10, 'Descrição deve ter ao menos 10 caracteres'),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'Previsão de término deve ser posterior à data de início', path: ['endDate'] }
)
```

---

## Componentes shadcn/ui Necessários

Instalar via CLI antes de implementar:

```
button, card, dialog, badge, dropdown-menu,
skeleton, separator, textarea, input, label,
form, scroll-area
```

---

## Tratamento de Erros

- Erros de mutation → toast via `sonner` com mensagem do backend (campo `message` do erro HTTP)
- Query com erro → mensagem inline + botão retry
- 404 no detalhe → `navigate('/projects')`
- Erro de validação do formulário → mensagem abaixo do campo (via `FormMessage` do shadcn/ui)

---

## Regras de UI derivadas das Regras de Negócio

| Regra do backend | Comportamento na UI |
|---|---|
| `in_progress` e `closed` não podem ser excluídos | Ocultar "Excluir" no DropdownMenu para esses status |
| `closed` e `cancelled` não têm próximo passo no pipeline | Ocultar botão "Avançar Status" |
| `closed` ainda pode ser cancelado | Botão "Cancelar projeto" visível para `closed` |
| `cancelled` não tem nenhuma transição válida | Ocultar tanto "Avançar" quanto "Cancelar" |
| Status inicial sempre `analysis` | Campo status não existe no formulário de criação |

---

## O Que Está Fora do Escopo

- Autenticação / login
- Paginação
- Filtros e busca
- Testes automatizados de frontend
- Deploy
