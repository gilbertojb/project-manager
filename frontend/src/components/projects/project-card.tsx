import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Loader2, MoreVertical, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { deleteProject, getAiAnalysis } from '@/api/projects';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { canDeleteProject, type Project } from '@/types/project';
import { ProjectRiskBadge } from './project-risk-badge';
import { ProjectStatusBadge } from './project-status-badge';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto removido com sucesso!');
    },
    onError: (err) => {
      const message = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Erro ao remover projeto')
        : 'Erro ao remover projeto';
      toast.error(message);
    },
  });

  const analysisMutation = useMutation({
    mutationFn: () => getAiAnalysis(project.id),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['projects', project.id],
        (old: typeof project | undefined) =>
          old ? { ...old, aiAnalysis: data } : old,
      );
      toast.success('Análise gerada com sucesso!');
    },
    onError: (err) => {
      const message = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Erro ao gerar análise')
        : 'Erro ao gerar análise';
      toast.error(message);
    },
  });

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={analysisMutation.isPending}
                >
                  {analysisMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                  <span className="sr-only">Ações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => analysisMutation.mutate()}
                  disabled={analysisMutation.isPending}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Solicitar análise com IA
                </DropdownMenuItem>
                {canDeleteProject(project.status) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <ProjectStatusBadge status={project.status} />
            <ProjectRiskBadge risk={project.risk} />
            {project.aiAnalysis && (
              <span title="Análise com IA disponível">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Orçamento</p>
              <p className="mt-0.5 truncate text-sm font-medium">
                {formatCurrency(project.budget)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Período</p>
              <p className="mt-0.5 truncate text-sm font-medium">
                {formatDate(project.startDate)} → {formatDate(project.endDate)}
              </p>
            </div>
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
  );
}
