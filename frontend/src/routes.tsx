import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './pages/_layouts/app';
import { ProjectDetailPage } from './pages/app/project-detail/project-detail';
import { ProjectsPage } from './pages/app/projects/projects';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
    ],
  },
]);
