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
