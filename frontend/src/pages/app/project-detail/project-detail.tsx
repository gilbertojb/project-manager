import { isAxiosError } from 'axios'
import {
  ArrowLeft,
  Brain,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useEffect, useState } from 'react'
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

  const is404 = isError && isAxiosError(error) && error.response?.status === 404

  useEffect(() => {
    if (is404) navigate('/projects', { replace: true })
  }, [is404, navigate])

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

  if (is404) return null

  if (isError) {
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
                  {aiAnalysis.attentionPoints.map((point) => (
                    <li
                      key={point}
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
