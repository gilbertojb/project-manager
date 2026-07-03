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
