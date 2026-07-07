import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RISK_LABELS, type RiskLevel } from '@/types/project';

interface ProjectRiskBadgeProps {
  risk: RiskLevel;
}

const riskStyles: Record<RiskLevel, string> = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  medium:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

export function ProjectRiskBadge({ risk }: ProjectRiskBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('px-2.5 font-medium', riskStyles[risk])}
    >
      Risco {RISK_LABELS[risk].toLowerCase()}
    </Badge>
  );
}
