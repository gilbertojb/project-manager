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
