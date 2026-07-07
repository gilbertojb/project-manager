# Spec 10 — Frontend Design System Refresh

**Data:** 2026-07-06
**Escopo:** frontend apenas — visual/estilo. Zero mudanças funcionais.

## Objetivo

Aplicar o design system extraído de três imagens de referência (UI clean, minimalista,
tema claro) a todo o frontend, e adicionar um gauge de risco na página de detalhe do
projeto seguindo a paleta da referência.

## Design System Extraído

### Cores (tema claro, padrão)

| Token | Valor | Origem |
|---|---|---|
| `--background` | off-white zinc (~#F4F4F6) | fundo das imagens 1 e 2 |
| `--card` / `--popover` | branco puro | cards e modais |
| `--border` | zinc-200 sutil | bordas dos cards da imagem 2 |
| `--primary` | quase-preto (zinc-900) | botão "Add New" da imagem 2 |
| `--muted` | zinc-100 | inputs preenchidos da imagem 1 |
| `--radius` | 1rem | cantos bem arredondados de todas as imagens |

Dark theme permanece disponível no toggle com os mesmos refinamentos.

### Tipografia

- **Inter** (Google Fonts) como fonte sans padrão, `antialiased`
- Títulos: bold, quase-preto; labels de metadados: cinza médio, acima do valor

### Semântica de cores (badges e gauge)

Pills suaves: fundo tintado claro + texto escuro da mesma família (imagem 3):

- Verde (emerald): risco baixo, projeto encerrado, "Low Impact"
- Âmbar (amber): risco médio, em andamento, "Moderate Impact"
- Vermelho (red): risco alto, cancelado, "High Impact"
- Azul (blue): aprovado
- Cinza (zinc): em análise

Variantes `dark:` com fundo `*/15` e texto `*-400`.

### Gauge de risco (imagem 3)

- SVG puro, sem lib de gráficos; arco de ~270° com `stroke-linecap="round"`
- Trilha cinza claro; arco preenchido com gradiente
- Score derivado do risco: baixo=25 (gradiente emerald), médio=60 (amber→orange),
  alto=85 (orange→red)
- Número grande no centro, label "Nível de Risco" abaixo, pill de risco sob o gauge

## Mudanças por Arquivo

| Arquivo | Mudança |
|---|---|
| `index.html` | link Google Fonts (Inter) |
| `src/global.css` | tokens light/dark, `--font-sans`, radius 1rem |
| `src/app.tsx` | `defaultTheme="light"` |
| `src/pages/_layouts/app.tsx` | header refinado (só estilo) |
| `src/pages/app/projects/projects.tsx` | espaçamentos/skeletons (só estilo) |
| `src/components/projects/project-card.tsx` | metadados label/valor estilo imagem 2 |
| `src/components/projects/project-status-badge.tsx` | pills suaves |
| `src/components/projects/project-risk-badge.tsx` | pills suaves |
| `src/components/projects/project-risk-gauge.tsx` | **novo** — gauge SVG |
| `src/pages/app/project-detail/project-detail.tsx` | layout em cards + gauge |
| `frontend/CLAUDE.md` | regra do tema padrão: `light` |

## Invariantes (não mudam)

- Queries, mutations, handlers, rotas, API client, tipos de domínio
- Componentes shadcn/ui em `src/components/ui/` (mudam só via tokens CSS)
- `storageKey="pm-theme"`, providers e ordem em `app.tsx`

## Critérios de Aceite

1. `pnpm exec tsc --noEmit`, `pnpm lint` e `pnpm build` passam
2. Tema claro por padrão, fiel às referências; dark funcional no toggle
3. Gauge visível no detalhe do projeto com cores verde/âmbar/vermelho conforme risco
4. Nenhuma mudança de comportamento em CRUD, status ou análise IA
