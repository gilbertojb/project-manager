import { Project } from "../domain/project.entity";

export interface ProjectHttpResponse {
  id: string;
  nome: string;
  dataInicio: string;
  previsaoTermino: string;
  orcamentoTotal: number;
  descricao: string;
  status: string;
  risco: string;
  criadoEm: string;
  atualizadoEm: string;
}

export class ProjectPresenter {
  static toHttp(project: Project): ProjectHttpResponse {
    return {
      id: project.id,
      nome: project.name,
      dataInicio: project.startDate.toISOString(),
      previsaoTermino: project.endDate.toISOString(),
      orcamentoTotal: project.budget,
      descricao: project.description,
      status: project.status,
      risco: project.risk,
      criadoEm: project.createdAt.toISOString(),
      atualizadoEm: project.updatedAt.toISOString(),
    };
  }

  static toHttpList(projects: Project[]): ProjectHttpResponse[] {
    return projects.map(ProjectPresenter.toHttp);
  }
}
