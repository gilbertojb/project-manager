import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type ProjectStatus, STATUS_LABELS } from '@/types/project';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const statusStyles: Record<ProjectStatus, string> = {
  analysis: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-400',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  in_progress:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  closed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('px-2.5 font-medium', statusStyles[status])}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
