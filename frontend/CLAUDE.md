# Frontend — Regras do Agente

## Stack

- Vite 6 + React 19 + TypeScript (strict)
- TailwindCSS v4 — plugin `@tailwindcss/vite` (sem `tailwind.config.js`, sem `postcss.config.js`)
- shadcn/ui — estilo new-york, base zinc, CSS variables com oklch
- react-router-dom v7 — SPA mode com `createBrowserRouter`
- @tanstack/react-query v5 — server state
- axios — HTTP client com `baseURL` via `env.VITE_API_URL`
- sonner — toasts
- zod v4 — validação de variáveis de ambiente
- Biome 2.x — lint + format (config própria; independente do backend)
- pnpm 10 — gerenciador de pacotes

## Arquitetura

SPA com roteamento client-side. Providers em `src/app.tsx` na ordem:

```
HelmetProvider → ThemeProvider → Toaster → QueryClientProvider → RouterProvider
```

Estrutura de páginas espelha o projeto de referência (pizzashop-web):

- `src/pages/_layouts/` — layouts compartilhados com `<Outlet />`
- `src/pages/app/` — páginas da área autenticada
- `src/routes.tsx` — definição de rotas com `createBrowserRouter`

## Regras Invioláveis

- Alias `@/` aponta para `./src/` — usar em todos os imports internos
- Nunca criar `tailwind.config.js` ou `postcss.config.js` — TW v4 usa só o plugin Vite
- Nunca commitar `.env` — apenas `.env.example`
- Tema padrão: `dark` (passado via `defaultTheme="dark"` no `ThemeProvider` em `app.tsx`)
- `storageKey` do tema: `"pm-theme"`
- Commits em inglês, sem linha `Co-Authored-By`

## Variáveis de Ambiente

```
VITE_API_URL=http://localhost:3000
```

Validadas via zod em `src/env.ts`. Todas as variáveis Vite devem ter prefixo `VITE_`.

## Comandos

```bash
pnpm dev          # servidor de desenvolvimento (http://localhost:5173)
pnpm build        # build de produção (tsc -b && vite build)
pnpm preview      # preview do build de produção
pnpm lint         # biome check .
pnpm format       # biome format --write .
pnpm exec tsc --noEmit   # verificar tipos sem gerar arquivos
```

## Estrutura de Arquivos

```
frontend/
  src/
    api/                        ← funções de chamada à API
    components/
      ui/                       ← componentes shadcn/ui (instalados via CLI)
      theme/
        theme-provider.tsx      ← ThemeProvider + useTheme
    lib/
      utils.ts                  ← cn(): string (clsx + tailwind-merge)
      axios.ts                  ← instância axios configurada
      react-query.ts            ← instância QueryClient
    pages/
      _layouts/
        app.tsx                 ← layout principal com <Outlet />
      app/                      ← páginas da área principal
    app.tsx                     ← root com todos os providers
    main.tsx                    ← entry point: createRoot + <App />
    routes.tsx                  ← createBrowserRouter
    global.css                  ← @import "tailwindcss" + CSS vars oklch
    env.ts                      ← validação de env com zod
    vite-env.d.ts               ← tipos Vite
  components.json               ← config shadcn/ui
  biome.json                    ← lint + format (frontend-specific)
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  package.json
  .env.example
```

## Instalação de Componentes shadcn/ui

Usar o CLI após o bootstrap:

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
# etc.
```

Os componentes são gerados em `src/components/ui/`.

## Adicionando Rotas

1. Criar o componente da página em `src/pages/app/<feature>/<feature>.tsx`
2. Importar e adicionar em `src/routes.tsx` como filho do `AppLayout`
3. Usar `<Helmet>` para definir o `<title>` da página
