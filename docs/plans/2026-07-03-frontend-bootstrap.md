# Frontend Bootstrap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o projeto frontend com Vite 6 + React 19 + TypeScript, TailwindCSS v4, shadcn/ui, react-router-dom v7 e uma única rota `/` renderizando "Hello World".

**Architecture:** SPA com Vite como build tool e dev server. Roteamento client-side via `createBrowserRouter` (react-router-dom v7). Providers na raiz do app: `HelmetProvider → ThemeProvider → Toaster → QueryClientProvider → RouterProvider`.

**Tech Stack:** React 19, Vite 6, TypeScript 5.7 (strict), TailwindCSS v4, shadcn/ui (new-york + zinc), react-router-dom v7, @tanstack/react-query v5, axios, sonner, zod v4, Biome 2.x, pnpm 10.

## Global Constraints

- Pasta raiz: `frontend/` dentro do monorepo `project-manager/`
- Package manager: pnpm 10
- TypeScript strict mode — `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`
- Alias `@/` aponta para `./src/`
- TailwindCSS v4: sem `tailwind.config.js`, sem `postcss.config.js` — usar plugin `@tailwindcss/vite`
- CSS custom properties oklch para o tema shadcn/ui no `global.css`
- `biome.json` do frontend é independente do backend — inclui regras JSX (`useExhaustiveDependencies`, `useHookAtTopLevel`) e a11y
- Commits em inglês, sem linha `Co-Authored-By`

---

### Task 1: Scaffold — Vite 6 + React 19 + TypeScript

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/index.html`
- Create: `frontend/vite.config.ts`
- Create: `frontend/src/vite-env.d.ts`
- Create: `frontend/src/main.tsx`

**Interfaces:**
- Produces: entry point `src/main.tsx` renderizando `<div>bootstrap</div>`; dev server em `http://localhost:5173`

- [ ] **Step 1: Criar `frontend/package.json`**

```json
{
  "name": "project-manager-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "biome check .",
    "format": "biome format --write .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.80.0",
    "axios": "^1.9.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.511.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-helmet-async": "^2.0.5",
    "react-router-dom": "^7.6.0",
    "sonner": "^2.0.3",
    "tailwind-merge": "^3.3.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.0.6",
    "@tailwindcss/vite": "^4.1.10",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.5.2",
    "tailwindcss": "^4.1.10",
    "typescript": "^5.8.3",
    "vite": "^6.3.5"
  }
}
```

- [ ] **Step 2: Criar `frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Criar `frontend/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Criar `frontend/index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Project Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Criar `frontend/vite.config.ts`**

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
});
```

- [ ] **Step 6: Criar `frontend/src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 7: Criar `frontend/src/main.tsx` (bootstrap mínimo)**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>bootstrap</div>
  </StrictMode>,
);
```

- [ ] **Step 8: Instalar dependências**

```bash
cd frontend && pnpm install
```

Esperado: `pnpm-lock.yaml` criado, `node_modules/` populado.

- [ ] **Step 9: Verificar dev server**

```bash
pnpm dev
```

Esperado: `VITE v6.x.x  ready in Xms → Local: http://localhost:5173/`. Abrir no browser: ver o texto "bootstrap".

- [ ] **Step 10: Commit**

```bash
git add frontend/
git commit -m "feat: initialize frontend with vite 6, react 19 and typescript"
```

---

### Task 2: TailwindCSS v4 + Biome + CSS base

**Files:**
- Create: `frontend/biome.json`
- Create: `frontend/src/global.css`
- Modify: `frontend/src/main.tsx` (adicionar import do `global.css` e usar classes Tailwind)

**Interfaces:**
- Consumes: `@tailwindcss/vite` e `@biomejs/biome` instalados no Task 1
- Produces: classes Tailwind funcionando no browser; `pnpm lint` sem erros

- [ ] **Step 1: Criar `frontend/biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "includes": ["**/*.ts", "**/*.tsx"]
  },
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "useExhaustiveDependencies": "error",
        "useHookAtTopLevel": "error"
      },
      "a11y": {
        "recommended": true
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  }
}
```

- [ ] **Step 2: Criar `frontend/src/global.css`**

CSS vars do tema shadcn/ui (new-york, zinc) para TailwindCSS v4:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.552 0.016 285.938);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 3: Atualizar `frontend/src/main.tsx`** para importar o CSS e usar classes do Tailwind

```tsx
import './global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      bootstrap
    </div>
  </StrictMode>,
);
```

- [ ] **Step 4: Verificar TailwindCSS e Biome**

```bash
pnpm lint
```

Esperado: sem erros. Abrir `http://localhost:5173` (pnpm dev): fundo e texto devem refletir as CSS vars (branco no light, escuro se o sistema estiver em dark mode).

- [ ] **Step 5: Commit**

```bash
git add frontend/biome.json frontend/src/global.css frontend/src/main.tsx
git commit -m "feat: add tailwindcss v4 and biome config"
```

---

### Task 3: shadcn/ui config + lib/utils + ThemeProvider

**Files:**
- Create: `frontend/components.json`
- Create: `frontend/src/lib/utils.ts`
- Create: `frontend/src/components/theme/theme-provider.tsx`

**Interfaces:**
- Consumes: `global.css` com CSS vars do Task 2; `clsx` e `tailwind-merge` instalados no Task 1
- Produces:
  - `cn(...inputs: ClassValue[]): string` exportado de `@/lib/utils`
  - `ThemeProvider` e `useTheme` exportados de `@/components/theme/theme-provider`

- [ ] **Step 1: Criar `frontend/components.json`**

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
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 2: Criar `frontend/src/lib/utils.ts`**

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Criar `frontend/src/components/theme/theme-provider.tsx`**

```tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'system',
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'pm-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme: (newTheme: Theme) => {
          localStorage.setItem(storageKey, newTheme);
          setTheme(newTheme);
        },
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
pnpm exec tsc --noEmit
```

Esperado: sem erros de tipo.

- [ ] **Step 5: Commit**

```bash
git add frontend/components.json frontend/src/lib/ frontend/src/components/
git commit -m "feat: add shadcn/ui config, utils and theme provider"
```

---

### Task 4: Env + Axios + React Query

**Files:**
- Create: `frontend/.gitignore`
- Create: `frontend/.env.example`
- Create: `frontend/.env` (não commitado)
- Create: `frontend/src/env.ts`
- Create: `frontend/src/lib/axios.ts`
- Create: `frontend/src/lib/react-query.ts`

**Interfaces:**
- Consumes: `zod` e `axios` instalados no Task 1
- Produces:
  - `env.VITE_API_URL: string` exportado de `@/env`
  - `api: AxiosInstance` exportado de `@/lib/axios`
  - `queryClient: QueryClient` exportado de `@/lib/react-query`

- [ ] **Step 1: Criar `frontend/.gitignore`**

```
node_modules
dist
.env
.env.local
*.local
```

- [ ] **Step 2: Criar `frontend/.env.example`**

```
VITE_API_URL=http://localhost:3000
```

- [ ] **Step 3: Criar `frontend/.env`** (não será commitado — está no .gitignore)

```
VITE_API_URL=http://localhost:3000
```

- [ ] **Step 4: Criar `frontend/src/env.ts`**

```ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
});

export const env = envSchema.parse(import.meta.env);
```

- [ ] **Step 5: Criar `frontend/src/lib/axios.ts`**

```ts
import axios from 'axios';
import { env } from '@/env';

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
});
```

- [ ] **Step 6: Criar `frontend/src/lib/react-query.ts`**

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();
```

- [ ] **Step 7: Verificar TypeScript**

```bash
pnpm exec tsc --noEmit
```

Esperado: sem erros de tipo.

- [ ] **Step 8: Commit**

```bash
git add frontend/.gitignore frontend/.env.example frontend/src/env.ts frontend/src/lib/axios.ts frontend/src/lib/react-query.ts
git commit -m "feat: add env validation, axios client and react-query"
```

---

### Task 5: Routing + Hello World + App root

**Files:**
- Create: `frontend/src/pages/_layouts/app.tsx`
- Create: `frontend/src/pages/app/home/home.tsx`
- Create: `frontend/src/routes.tsx`
- Create: `frontend/src/app.tsx`
- Modify: `frontend/src/main.tsx` (substituir conteúdo completo)

**Interfaces:**
- Consumes:
  - `ThemeProvider` de `@/components/theme/theme-provider`
  - `queryClient: QueryClient` de `@/lib/react-query`
- Produces: app completo em `http://localhost:5173` — título da aba "Home | Project Manager", fundo escuro (dark mode padrão), `<h1>Hello World</h1>` centralizado

- [ ] **Step 1: Criar `frontend/src/pages/_layouts/app.tsx`**

```tsx
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 2: Criar `frontend/src/pages/app/home/home.tsx`**

```tsx
import { Helmet } from 'react-helmet-async';

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>Home | Project Manager</title>
      </Helmet>
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-4xl font-bold">Hello World</h1>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Criar `frontend/src/routes.tsx`**

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './pages/_layouts/app';
import { HomePage } from './pages/app/home/home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);
```

- [ ] **Step 4: Criar `frontend/src/app.tsx`**

```tsx
import './global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { queryClient } from '@/lib/react-query';
import { router } from './routes';

export function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="pm-theme">
        <Toaster richColors />
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
```

- [ ] **Step 5: Substituir `frontend/src/main.tsx`** com conteúdo completo abaixo

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Verificar TypeScript**

```bash
pnpm exec tsc --noEmit
```

Esperado: sem erros de tipo.

- [ ] **Step 7: Verificar no browser**

```bash
pnpm dev
```

Abrir `http://localhost:5173` e confirmar:
1. Título da aba do browser: **"Home | Project Manager"**
2. Fundo escuro (dark mode — `defaultTheme="dark"`)
3. Texto **"Hello World"** centralizado e em negrito (font-bold)

- [ ] **Step 8: Commit**

```bash
git add frontend/src/
git commit -m "feat: add routing, app layout and hello world page"
```
