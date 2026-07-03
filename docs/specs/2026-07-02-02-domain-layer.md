# Spec 02 — Camada de Domínio

**Data:** 2026-07-02
**Commits:** 7f19ae6, 810a380
**Status:** Implementado

---

## Objetivo

Definir o modelo de domínio do projeto com suas regras de negócio encapsuladas, sem nenhuma dependência de framework (NestJS, Prisma, etc.).

---

## Entidade `Project`

**Arquivo:** `src/projects/domain/project.entity.ts`

Criada com o padrão de acesso privado — o estado interno (`_data: ProjectData`) só é modificado pelos próprios métodos da entidade.

### Campos

| Campo | Tipo | Notas |
|-------|------|-------|
| id | string (UUID) | Gerado pelo `crypto.randomUUID()` na criação |
| name | string | Nome do projeto |
| startDate | Date | Data de início |
| endDate | Date | Previsão de término |
| budget | number | Orçamento total em R$ |
| description | string | Descrição do projeto |
| status | ProjectStatus | Calculado por transições, não editável diretamente |
| risk | ProjectRisk | **Sempre recalculado pela entidade**, nunca por use-case |
| createdAt | Date | Imutável após criação |
| updatedAt | Date | Atualizado em qualquer mutação |

### Factory Methods

- `Project.create(props: ProjectProps)` — cria novo projeto com status `analysis` e risco calculado
- `Project.restore(data: ProjectData)` — reconstrói a entidade a partir de dados persistidos (sem recalcular)

---

## Cálculo de Risco

Dois fatores determinam o risco, e prevalece o mais alto entre eles:

**Por orçamento:**
- `budget > 500.000` → HIGH
- `budget > 100.000` → MEDIUM
- resto → LOW

**Por duração:**
- duração > 6 meses → HIGH
- duração > 3 meses → MEDIUM
- resto → LOW

---

## Status e Transições

**Enum `ProjectStatus`:** `analysis | approved | in_progress | closed | cancelled`

**Sequência obrigatória:**
```
analysis → approved → in_progress → closed
                   ↘              ↘
                   cancelled    cancelled
analysis → cancelled
```

A entidade valida cada transição contra `STATUS_TRANSITIONS` e lança erro se inválida. O use-case não valida — só chama `project.transitionTo()`.

---

## Regras de Deleção

Projetos com status `in_progress` ou `closed` **não podem ser deletados**. Verificado via `project.isDeletable()`.

---

## Repositório — Interface

**Arquivo:** `src/projects/repositories/projects.repository.ts`

`IProjectsRepository` é uma **classe abstrata** (não interface TypeScript) para ser compatível com o sistema de injeção de dependência do NestJS.

```typescript
abstract class IProjectsRepository {
  abstract findAll(): Promise<Project[]>
  abstract findById(id: string): Promise<Project | null>
  abstract create(project: Project): Promise<void>
  abstract update(project: Project): Promise<void>
  abstract delete(id: string): Promise<void>
}
```

---

## Implementação In-Memory

**Arquivo:** `src/projects/persistence/in-memory-projects.repository.ts`

`InMemoryProjectsRepository` estende `IProjectsRepository` usando um `Map<string, Project>` em memória. Usado em **todos os testes de use-cases** e como implementação padrão antes da integração com banco de dados.

---

## Convenção de Nomes

- **Domínio:** inglês (`name`, `startDate`, `endDate`, `budget`, `description`)
- **HTTP API:** português (`nome`, `dataInicio`, `previsaoTermino`, `orcamentoTotal`, `descricao`)
- A conversão acontece no controller e no presenter — nunca no domínio
