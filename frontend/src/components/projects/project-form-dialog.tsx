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
