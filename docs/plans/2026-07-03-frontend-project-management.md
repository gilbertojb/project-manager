# Frontend: Área de Gestão de Projetos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a área completa de gestão de projetos no frontend React, conectada à API REST já implementada no backend.

**Architecture:** SPA com duas rotas — `/projects` (grid de cards) e `/projects/:id` (detalhe com ações de status e análise de IA inline). Formulário de criação/edição como Dialog shadcn/ui. Estado de servidor gerenciado por React Query v5, formulários por react-hook-form + zod v4.

**Tech Stack:** React 19, Vite 6, TypeScript strict, TailwindCSS v4, shadcn/ui (new-york, zinc), react-router-dom v7, @tanstack/react-query v5, axios, react-hook-form, @hookform/resolvers, zod v4, sonner, lucide-react.

## Global Constraints

- TailwindCSS v4: nunca criar `tailwind.config.js` ou `postcss.config.js`
- shadcn/ui: instalar via `pnpm dlx shadcn@latest add <component>`
- Alias `@/` aponta para `./src/` — usar em todos os imports internos
- Tema padrão: `dark`; storageKey `"pm-theme"`
- Commits em inglês, sem linha `Co-Authored-By`
- Status do backend: strings lowercase inglês (`analysis`, `approved`, `in_progress`, `closed`, `cancelled`)
- Risco do backend: strings lowercase inglês (`low`, `medium`, `high`)
- Erros de mutation: exibir via `sonner` com campo `message` da resposta do backend
- Sem autenticação, paginação ou filtros

---

### Task 1: Instalar dependências e componentes shadcn/ui

**Files:**
- Modify: `frontend/package.json` (via pnpm)
- Create: `frontend/src/components/ui/*.tsx` (via shadcn CLI)

**Interfaces:**
- Produces: componentes `Button`, `Card`, `Dialog`, `Badge`, `DropdownMenu`, `Skeleton`, `Separator`, `Textarea`, `Input`, `Label`, `Form`, `ScrollArea`, `AlertDialog` disponíveis em `@/components/ui/`

- [ ] **Step 1: Instalar react-hook-form e resolver**

```bash
cd /Users/gilbertobueno/Projects/codegroup/project-manager/frontend
pnpm add react-hook-form @hookform/resolvers
```

Expected: pacotes adicionados sem erros.

- [ ] **Step 2: Instalar componentes shadcn/ui**

```bash
pnpm dlx shadcn@latest add button card dialog badge dropdown-menu skeleton separator textarea input label form scroll-area alert-dialog
```

Expected: arquivos gerados em `src/components/ui/`. Responder "y" a quaisquer prompts de sobrescrita.

- [ ] **Step 3: Verificar instalação**

```bash
ls src/components/ui/
```

Expected: `button.tsx`, `card.tsx`, `dialog.tsx`, `badge.tsx`, `dropdown-menu.tsx`, `skeleton.tsx`, `separator.tsx`, `textarea.tsx`, `input.tsx`, `label.tsx`, `form.tsx`, `scroll-area.tsx`, `alert-dialog.tsx`.

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/pnpm-lock.yaml frontend/src/components/ui/
git commit -m "feat: install react-hook-form and shadcn/ui components"
```

---

### Task 2: Tipos do domínio e utilitários de formatação

**Files:**
- Create: `frontend/src/types/project.ts`
- Create: `frontend/src/lib/formatters.ts`

**Interfaces:**
- Produces:
  - Tipos: `ProjectStatus`, `RiskLevel`, `Project`, `AiAnalysis`, `CreateProjectData`, `UpdateProjectData`
  - Constantes: `STATUS_LABELS`, `RISK_LABELS`, `NEXT_STATUS`, `ADVANCE_LABEL`
  - Funções: `canDeleteProject(status): boolean`, `canCancelProject(status): boolean`
  - Formatadores: `formatCurrency(n): string`, `formatDate(iso): string`, `toDateInputValue(iso): string`

- [ ] **Step 1: Criar `src/types/project.ts`**

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
  startDate: string
  endDate: string
  budget: number
  description: string
  status: ProjectStatus
  risk: RiskLevel
  createdAt: string
  updatedAt: string
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

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  analysis: 'Em análise',
  approved: 'Aprovado',
  in_progress: 'Em andamento',
  closed: 'Encerrado',
  cancelled: 'Cancelado',
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
}

export const NEXT_STATUS: Partial<Record<ProjectStatus, ProjectStatus>> = {
  analysis: 'approved',
  approved: 'in_progress',
  in_progress: 'closed',
}

export const ADVANCE_LABEL: Partial<Record<ProjectStatus, string>> = {
  analysis: 'Aprovar projeto',
  approved: 'Iniciar projeto',
  in_progress: 'Encerrar projeto',
}

export function canDeleteProject(status: ProjectStatus): boolean {
  return status !== 'in_progress' && status !== 'closed'
}

export function canCancelProject(status: ProjectStatus): boolean {
  return status !== 'cancelled'
}
```

- [ ] **Step 2: Criar `src/lib/formatters.ts`**

```ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export function toDateInputValue(isoString: string): string {
  return isoString.split('T')[0]
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd frontend && pnpm exec tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/project.ts frontend/src/lib/formatters.ts
git commit -m "feat: add project domain types and formatters"
```

---

### Task 3: Camada de API

**Files:**
- Create: `frontend/src/api/projects.ts`

**Interfaces:**
- Consumes: `api` de `@/lib/axios`, tipos de `@/types/project`
- Produces:
  - `listProjects(): Promise<Project[]>`
  - `getProject(id: string): Promise<Project>`
  - `createProject(data: CreateProjectData): Promise<Project>`
  - `updateProject(id: string, data: UpdateProjectData): Promise<Project>`
  - `deleteProject(id: string): Promise<void>`
  - `updateProjectStatus(id: string, status: ProjectStatus): Promise<Project>`
  - `getAiAnalysis(id: string): Promise<AiAnalysis>`

- [ ] **Step 1: Criar `src/api/projects.ts`**

```ts
import { api } from '@/lib/axios'
import type {
  AiAnalysis,
  CreateProjectData,
  Project,
  ProjectStatus,
  UpdateProjectData,
} from '@/types/project'

export async function listProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>('/projects')
  return data
}

export async function getProject(id: string): Promise<Project> {
  const { data } = await api.get<Project>(`/projects/${id}`)
  return data
}

export async function createProject(body: CreateProjectData): Promise<Project> {
  const { data } = await api.post<Project>('/projects', body)
  return data
}

export async function updateProject(
  id: string,
  body: UpdateProjectData,
): Promise<Project> {
  const { data } = await api.patch<Project>(`/projects/${id}`, body)
  return data
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`)
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<Project> {
  const { data } = await api.patch<Project>(`/projects/${id}/status`, {
    status,
  })
  return data
}

export async function getAiAnalysis(id: string): Promise<AiAnalysis> {
  const { data } = await api.get<AiAnalysis>(`/projects/${id}/ai-analysis`)
  return data
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd frontend && pnpm exec tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/projects.ts
git commit -m "feat: add projects API layer"
```

---

### Task 4: AppLayout com header e rotas

**Files:**
- Modify: `frontend/src/pages/_layouts/app.tsx`
- Modify: `frontend/src/routes.tsx`

**Interfaces:**
- Consumes: `useTheme` de `@/components/theme/theme-provider`; `Button` de `@/components/ui/button`
- Produces: layout com header fixo + `<Outlet />`; rota `/` redireciona para `/projects`

- [ ] **Step 1: Atualizar `src/pages/_layouts/app.tsx`**

```tsx
import { Moon, Sun } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme/theme-provider'

export function AppLayout() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-tight">
            Gestão de Projetos
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Criar stubs temporários para as páginas (evitar erros de compilação)**

```tsx
// src/pages/app/projects/projects.tsx
export function ProjectsPage() {
  return <div>Projetos</div>
}
```

```tsx
// src/pages/app/project-detail/project-detail.tsx
export function ProjectDetailPage() {
  return <div>Detalhe</div>
}
```

- [ ] **Step 3: Atualizar `src/routes.tsx`**

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './pages/_layouts/app'
import { ProjectDetailPage } from './pages/app/project-detail/project-detail'
import { ProjectsPage } from './pages/app/projects/projects'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
    ],
  },
])
```

- [ ] **Step 4: Remover página home (não mais usada)**

```bash
git rm frontend/src/pages/app/home/home.tsx
```

- [ ] **Step 5: Verificar compilação**

```bash
cd frontend && pnpm exec tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/_layouts/app.tsx frontend/src/routes.tsx \
  frontend/src/pages/app/projects/projects.tsx \
  frontend/src/pages/app/project-detail/project-detail.tsx
git commit -m "feat: add app layout with header and configure routes"
```

---

### Task 5: Badges de status e risco

**Files:**
- Create: `frontend/src/components/projects/project-status-badge.tsx`
- Create: `frontend/src/components/projects/project-risk-badge.tsx`

**Interfaces:**
- Consumes: `Badge` de `@/components/ui/badge`; `STATUS_LABELS`, `RISK_LABELS`, `ProjectStatus`, `RiskLevel` de `@/types/project`; `cn` de `@/lib/utils`
- Produces: `<ProjectStatusBadge status />`, `<ProjectRiskBadge risk />`

- [ ] **Step 1: Criar `src/components/projects/project-status-badge.tsx`**

```tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { STATUS_LABELS, type ProjectStatus } from '@/types/project'

interface ProjectStatusBadgeProps {
  status: ProjectStatus
}

const statusStyles: Record<ProjectStatus, string> = {
  analysis: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  closed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-medium', statusStyles[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
```

- [ ] **Step 2: Criar `src/components/projects/project-risk-badge.tsx`**

```tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { RISK_LABELS, type RiskLevel } from '@/types/project'

interface ProjectRiskBadgeProps {
  risk: RiskLevel
}

const riskStyles: Record<RiskLevel, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function ProjectRiskBadge({ risk }: ProjectRiskBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-medium', riskStyles[risk])}>
      {RISK_LABELS[risk]}
    </Badge>
  )
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd frontend && pnpm exec tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/projects/
git commit -m "feat: add project status and risk badge components"
```

---

### Task 6: Formulário de projeto (react-hook-form + zod)

**Files:**
- Create: `frontend/src/components/projects/project-form.tsx`

**Interfaces:**
- Consumes: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` de `@/components/ui/form`; `Input` de `@/components/ui/input`; `Textarea` de `@/components/ui/textarea`; `Button` de `@/components/ui/button`; `useForm` de `react-hook-form`; `zodResolver` de `@hookform/resolvers/zod`; `z` de `zod`; `UpdateProjectData` de `@/types/project`
- Produces:
  - `ProjectFormValues` (tipo exportado)
  - `<ProjectForm defaultValues? onSubmit isSubmitting />`

- [ ] **Step 1: Criar `src/components/projects/project-form.tsx`**

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { UpdateProjectData } from '@/types/project'

const projectSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
    startDate: z.string().min(1, 'Data de início obrigatória'),
    endDate: z.string().min(1, 'Previsão de término obrigatória'),
    budget: z.coerce
      .number({ message: 'Orçamento inválido' })
      .positive('Orçamento deve ser positivo'),
    description: z
      .string()
      .min(10, 'Descrição deve ter ao menos 10 caracteres'),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'Previsão de término deve ser posterior à data de início',
    path: ['endDate'],
  })

export type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  defaultValues?: UpdateProjectData
  onSubmit: (data: ProjectFormValues) => Promise<void>
  isSubmitting: boolean
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      startDate: defaultValues?.startDate ?? '',
      endDate: defaultValues?.endDate ?? '',
      budget: defaultValues?.budget,
      description: defaultValues?.description ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do projeto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Previsão de término</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orçamento (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o projeto..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

Nota: se `@hookform/resolvers/zod` reportar incompatibilidade com zod v4, tente o import `@hookform/resolvers/zod/v4` e reinstale com `pnpm add @hookform/resolvers@latest`.

- [ ] **Step 2: Verificar tipos**

```bash
cd frontend && pnpm exec tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/projects/project-form.tsx
git commit -m "feat: add project form with react-hook-form and zod validation"
```

---

### Task 7: Dialog do formulário (create/edit)

**Files:**
- Create: `frontend/src/components/projects/project-form-dialog.tsx`

**Interfaces:**
- Consumes: `ProjectForm`, `ProjectFormValues` de `./project-form`; `createProject`, `updateProject` de `@/api/projects`; `Project` de `@/types/project`; `toDateInputValue` de `@/lib/formatters`; `Dialog*` de `@/components/ui/dialog`; `useMutation`, `useQueryClient` de `@tanstack/react-query`; `toast` de `sonner`; `isAxiosError` de `axios`
- Produces: `<ProjectFormDialog open onOpenChange project? />`

- [ ] **Step 1: Criar `src/components/projects/project-form-dialog.tsx`**

```tsx
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createProject, updateProject } from '@/api/projects'
import { toDateInputValue } from '@/lib/formatters'
import type { Project } from '@/types/project'
import { ProjectForm, type ProjectFormValues } from './project-form'

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: ProjectFormDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!project

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      onOpenChange(false)
      toast.success('Projeto criado com sucesso!')
    },
    onError: (err) => {
      const message = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Erro ao criar projeto')
        : 'Erro ao criar projeto'
      toast.error(message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => updateProject(project!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', project!.id] })
      onOpenChange(false)
      toast.success('Projeto atualizado com sucesso!')
    },
    onError: (err) => {
      const message = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Erro ao atualizar projeto')
        : 'Erro ao atualizar projeto'
      toast.error(message)
    },
  })

  async function handleSubmit(data: ProjectFormValues) {
    if (isEditing) {
      await updateMutation.mutateAsync(data)
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  const defaultValues = project
    ? {
        name: project.name,
        startDate: toDateInputValue(project.startDate),
        endDate: toDateInputValue(project.endDate),
        budget: project.budget,
        description: project.description,
      }
    : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
          </DialogTitle>
        </DialogHeader>
        {/* key força reinicialização do formulário ao trocar entre criar/editar */}
        <ProjectForm
          key={project?.id ?? 'new'}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd frontend && pnpm exec tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/projects/project-form-dialog.tsx
git commit -m "feat: add project form dialog for create and edit"
```

---

### Task 8: Card de projeto

**Files:**
- Create: `frontend/src/components/projects/project-card.tsx`

**Interfaces:**
- Consumes: `Card*` de `@/components/ui/card`; `Button` de `@/components/ui/button`; `DropdownMenu*` de `@/components/ui/dropdown-menu`; `AlertDialog*` de `@/components/ui/alert-dialog`; `ProjectStatusBadge`, `ProjectRiskBadge`; `canDeleteProject`, `Project` de `@/types/project`; `formatCurrency`, `formatDate` de `@/lib/formatters`; `deleteProject` de `@/api/projects`; `useMutation`, `useQueryClient` de `@tanstack/react-query`; `toast` de `sonner`; `isAxiosError` de `axios`
- Produces: `<ProjectCard project onEdit />`

- [ ] **Step 1: Criar `src/components/projects/project-card.tsx`**

```tsx
import { isAxiosError } from 'axios'
import { Calendar, DollarSign, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteProject } from '@/api/projects'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { canDeleteProject, type Project } from '@/types/project'
import { ProjectRiskBadge } from './project-risk-badge'
import { ProjectStatusBadge } from './project-status-badge'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Projeto removido com sucesso!')
    },
    onError: (err) => {
      const message = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Erro ao remover projeto')
        : 'Erro ao remover projeto'
      toast.error(message)
    },
  })

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base leading-tight">
              {project.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Ações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                {canDeleteProject(project.status) && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <ProjectStatusBadge status={project.status} />
            <ProjectRiskBadge risk={project.risk} />
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-2 pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span>{formatCurrency(project.budget)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatDate(project.startDate)} → {formatDate(project.endDate)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/projects/${project.id}`}>Ver detalhes</Link>
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              O projeto <strong>{project.name}</strong> será removido
              permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd frontend && pnpm exec tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/projects/project-card.tsx
git commit -m "feat: add project card component"
```

---

### Task 9: Página de listagem de projetos

**Files:**
- Modify: `frontend/src/pages/app/projects/projects.tsx` (substituir stub)

**Interfaces:**
- Consumes: `ProjectCard`, `ProjectFormDialog`; `listProjects` de `@/api/projects`; `useQuery` de `@tanstack/react-query`; `Skeleton` de `@/components/ui/skeleton`; `Button` de `@/components/ui/button`; `Project` de `@/types/project`
- Produces: página `/projects` com grid de cards, estados de loading/empty/error e dialog de criação/edição

- [ ] **Step 1: Substituir stub em `src/pages/app/projects/projects.tsx`**

```tsx
import { FolderOpen, Plus } from 'lucide-react'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { listProjects } from '@/api/projects'
import { ProjectCard } from '@/components/projects/project-card'
import { ProjectFormDialog } from '@/components/projects/project-form-dialog'
import type { Project } from '@/types/project'

export function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()

  const { data: projects, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  })

  function handleCreate() {
    setEditingProject(undefined)
    setDialogOpen(true)
  }

  function handleEdit(project: Project) {
    setEditingProject(project)
    setDialogOpen(true)
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open)
    if (!open) setEditingProject(undefined)
  }

  return (
    <>
      <Helmet>
        <title>Projetos</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar os projetos.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !isError && projects?.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">Nenhum projeto cadastrado</p>
              <p className="text-sm text-muted-foreground">
                Crie seu primeiro projeto para começar.
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro projeto
            </Button>
          </div>
        )}

        {!isLoading && !isError && projects && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        project={editingProject}
      />
    </>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd frontend && pnpm exec tsc --noEmit
```

- [ ] **Step 3: Rodar a app e verificar visualmente**

```bash
cd frontend && pnpm dev
```

Abrir `http://localhost:5173`. Verificar:
- Redireciona para `/projects`
- Header com "Gestão de Projetos" e toggle de tema funcional
- Com backend rodando: cards aparecem (ou empty state)
- "Novo Projeto" abre dialog; formulário valida inline; toast de sucesso após criar
- DropdownMenu no card: Editar abre dialog com dados preenchidos
- Excluir (para projetos deletáveis): AlertDialog de confirmação

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/app/projects/projects.tsx
git commit -m "feat: add projects list page with card grid and empty/error states"
```

---

### Task 10: Página de detalhe do projeto

**Files:**
- Modify: `frontend/src/pages/app/project-detail/project-detail.tsx` (substituir stub)

**Interfaces:**
- Consumes: `getProject`, `updateProjectStatus`, `getAiAnalysis` de `@/api/projects`; `ProjectFormDialog`; `ProjectStatusBadge`, `ProjectRiskBadge`; `useQuery`, `useMutation`, `useQueryClient` de `@tanstack/react-query`; `useParams`, `useNavigate`, `Link` de `react-router-dom`; `NEXT_STATUS`, `ADVANCE_LABEL`, `canCancelProject`, `Project`, `ProjectStatus` de `@/types/project`; `formatCurrency`, `formatDate` de `@/lib/formatters`; `Separator`, `Skeleton`, `Button` de `@/components/ui/`; `isAxiosError` de `axios`; `toast` de `sonner`
- Produces: página `/projects/:id` com dados completos, ações de status e análise de IA inline

- [ ] **Step 1: Substituir stub em `src/pages/app/project-detail/project-detail.tsx`**

```tsx
import { isAxiosError } from 'axios'
import {
  ArrowLeft,
  Brain,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getAiAnalysis, getProject, updateProjectStatus } from '@/api/projects'
import { ProjectFormDialog } from '@/components/projects/project-form-dialog'
import { ProjectRiskBadge } from '@/components/projects/project-risk-badge'
import { ProjectStatusBadge } from '@/components/projects/project-status-badge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import {
  ADVANCE_LABEL,
  NEXT_STATUS,
  canCancelProject,
  type Project,
  type ProjectStatus,
} from '@/types/project'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const {
    data: project,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id!),
    enabled: !!id,
    retry: (_, err) => {
      if (isAxiosError(err) && err.response?.status === 404) return false
      return true
    },
  })

  const {
    data: aiAnalysis,
    isFetching: isLoadingAi,
    isError: isAiError,
    refetch: generateAnalysis,
  } = useQuery({
    queryKey: ['projects', id, 'ai-analysis'],
    queryFn: () => getAiAnalysis(id!),
    enabled: false,
    retry: false,
  })

  const statusMutation = useMutation({
    mutationFn: (nextStatus: ProjectStatus) =>
      updateProjectStatus(id!, nextStatus),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.setQueryData(['projects', id], updated)
      toast.success('Status atualizado com sucesso!')
    },
    onError: (err) => {
      const message = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Erro ao atualizar status')
        : 'Erro ao atualizar status'
      toast.error(message)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (isError) {
    if (isAxiosError(error) && error.response?.status === 404) {
      navigate('/projects', { replace: true })
      return null
    }
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar o projeto.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/projects">Voltar para a lista</Link>
        </Button>
      </div>
    )
  }

  if (!project) return null

  const nextStatus = NEXT_STATUS[project.status]
  const advanceLabel = ADVANCE_LABEL[project.status]
  const showCancel = canCancelProject(project.status)

  return (
    <>
      <Helmet>
        <title>{project.name}</title>
      </Helmet>

      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            <ProjectRiskBadge risk={project.risk} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Orçamento</p>
              <p className="font-medium">{formatCurrency(project.budget)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Período</p>
              <p className="font-medium">
                {formatDate(project.startDate)} → {formatDate(project.endDate)}
              </p>
            </div>
          </div>
          {project.description && (
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Descrição</p>
              <p className="mt-1 text-sm leading-relaxed">{project.description}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          {nextStatus && advanceLabel && (
            <Button
              onClick={() => statusMutation.mutate(nextStatus)}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {advanceLabel}
            </Button>
          )}
          {showCancel && (
            <Button
              variant="destructive"
              onClick={() => statusMutation.mutate('cancelled')}
              disabled={statusMutation.isPending}
            >
              Cancelar projeto
            </Button>
          )}
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            Editar
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Análise com IA</h2>
          </div>

          {!aiAnalysis && !isLoadingAi && !isAiError && (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                Gere uma análise executiva deste projeto com apoio de
                Inteligência Artificial.
              </p>
              <Button onClick={() => generateAnalysis()} variant="outline">
                <Brain className="mr-2 h-4 w-4" />
                Gerar análise
              </Button>
            </div>
          )}

          {isLoadingAi && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando análise...
            </div>
          )}

          {isAiError && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não foi possível gerar a análise.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateAnalysis()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          )}

          {aiAnalysis && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 text-sm font-semibold">Resumo</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {aiAnalysis.summary}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 text-sm font-semibold">
                  Pontos de atenção
                </h3>
                <ul className="space-y-1">
                  {aiAnalysis.attentionPoints.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 text-sm font-semibold">
                  Recomendação executiva
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {aiAnalysis.executiveRecommendation}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => generateAnalysis()}
                disabled={isLoadingAi}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerar análise
              </Button>
            </div>
          )}
        </div>
      </div>

      <ProjectFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        project={project}
      />
    </>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd frontend && pnpm exec tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 3: Testar fluxo completo**

Com backend rodando (`cd backend && pnpm run start:dev`):

1. Criar projeto → aparece na lista com badge "Em análise" + risco calculado
2. Clicar "Ver detalhes" → página de detalhe carrega com dados corretos
3. Clicar "Aprovar projeto" → badge muda para "Aprovado"; botão vira "Iniciar projeto"
4. Clicar "Iniciar projeto" → badge vira "Em andamento"; opção Excluir some do card
5. Clicar "Encerrar projeto" → badge vira "Encerrado"; botões Avançar e Cancelar somem
6. Editar projeto → dialog abre com dados preenchidos corretamente (datas no formato YYYY-MM-DD)
7. Clicar "Gerar análise" → loading spinner, depois 3 seções de resultado
8. Botão "Regenerar análise" → refaz a chamada
9. Excluir projeto `analysis` ou `approved` → AlertDialog de confirmação → sumiu da lista

- [ ] **Step 4: Commit final**

```bash
git add frontend/src/pages/app/project-detail/project-detail.tsx
git commit -m "feat: add project detail page with status actions and AI analysis"
```
