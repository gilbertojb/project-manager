# Spec 08 — Frontend Bootstrap

**Data:** 2026-07-03
**Status:** Pendente de implementação

---

## Objetivo

Criar a base do projeto frontend com todas as ferramentas configuradas e uma única rota funcional (`/` → Hello World), pronto para receber as telas da aplicação.

---

## Stack

| Ferramenta | Versão | Papel |
|---|---|---|
| Node.js | 20 | Runtime |
| pnpm | 10 | Gerenciador de pacotes |
| Vite | 6 | Build tool + dev server |
| React | 19 | UI library |
| TypeScript | 5.7 (strict) | Linguagem |
| TailwindCSS | 4 | CSS utility-first |
| shadcn/ui | latest | Componentes (Radix UI + CVA + lucide-react) |
| react-router-dom | 7 | Roteamento SPA |
| @tanstack/react-query | 5 | Server state |
| axios | 1.x | HTTP client |
| sonner | latest | Toasts |
| zod | 4 | Validação de variáveis de ambiente |
| Biome | 2.x | Lint + format (config própria do frontend) |

---

## Estrutura de Pastas

```
frontend/
├── src/
│   ├── api/                        ← funções de chamada à API (vazio no bootstrap)
│   ├── components/
│   │   ├── ui/                     ← componentes shadcn/ui instalados via CLI
│   │   └── theme/
│   │       └── theme-provider.tsx  ← ThemeProvider com suporte dark/light
│   ├── lib/
│   │   ├── utils.ts                ← função cn() (clsx + tailwind-merge)
│   │   ├── axios.ts                ← instância axios com baseURL via env
│   │   └── react-query.ts          ← instância QueryClient
│   ├── pages/
│   │   ├── _layouts/
│   │   │   └── app.tsx             ← layout principal com <Outlet />
│   │   └── app/
│   │       └── home/
│   │           └── home.tsx        ← página Hello World (rota "/")
│   ├── app.tsx                     ← root: ThemeProvider, QueryClientProvider, RouterProvider, Toaster
│   ├── main.tsx                    ← entry point: ReactDOM.createRoot
│   ├── routes.tsx                  ← createBrowserRouter com rota "/"
│   ├── global.css                  ← @import "tailwindcss" + CSS vars shadcn/ui
│   ├── env.ts                      ← validação de env com zod
│   └── vite-env.d.ts               ← tipos do Vite
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── biome.json
├── components.json                 ← config do shadcn/ui (aliases, style, TW v4)
└── package.json
```

---

## Roteamento

Arquivo: `src/routes.tsx`

```
/  →  AppLayout (_layouts/app.tsx)  →  HomePage (pages/app/home/home.tsx)
```

- `createBrowserRouter` do react-router-dom v7
- `AppLayout` contém apenas `<Outlet />` no bootstrap — sem header, sem sidebar
- `HomePage` renderiza `<h1>Hello World</h1>` com título via `<Helmet>`

---

## Arquivos de Configuração

### `vite.config.ts`

Usa o plugin oficial `@tailwindcss/vite` — sem `postcss.config.js`, sem `tailwind.config.js`:

```ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
})
```

### `src/global.css`

TailwindCSS v4 usa import único:

```css
@import "tailwindcss";

@layer base {
  :root {
    /* CSS vars do tema shadcn/ui (light) */
  }
  .dark {
    /* CSS vars do tema shadcn/ui (dark) */
  }
}
```

### `biome.json` (frontend)

Configuração independente do backend, voltada para React/TSX:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "useExhaustiveDependencies": "error",
        "useHookAtTopLevel": "error"
      },
      "a11y": { "recommended": true }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "javascript": {
    "formatter": { "quoteStyle": "single", "semicolons": "always" }
  }
}
```

### `components.json`

Config shadcn/ui para TailwindCSS v4:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/global.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  }
}
```

### `src/env.ts`

```ts
import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
})

export const env = envSchema.parse(import.meta.env)
```

### `src/lib/axios.ts`

```ts
import axios from 'axios'
import { env } from '@/env'

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
})
```

### Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "biome check .",
    "format": "biome format --write .",
    "preview": "vite preview"
  }
}
```

---

## Decisões

| Decisão | Escolha | Motivo |
|---|---|---|
| Biome vs ESLint | Biome (config própria) | Consistência de ferramenta com backend; config frontend tem regras JSX/a11y |
| TW v4 vs v3 | v4 | Versão mais recente; plugin Vite nativo elimina PostCSS |
| Router v6 vs v7 | v7 | Versão mais recente; API `createBrowserRouter` compatível com SPA |
| React 18 vs 19 | 19 | Estável desde dez/2024; sem `forwardRef`, hooks concorrentes |
| `react-helmet-async` | mantido | Gerenciamento de `<title>` por página |

---

## Fora do Escopo desta Spec

- Tela de login / cadastro
- Header, sidebar ou navegação
- Integração com a API do backend
- Testes (E2E ou unitários)
- Deploy / CI
