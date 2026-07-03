import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RISK_LABELS, type RiskLevel } from '@/types/project';

interface ProjectRiskBadgeProps {
  risk: RiskLevel;
}

const riskStyles: Record<RiskLevel, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function ProjectRiskBadge({ risk }: ProjectRiskBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-medium', riskStyles[risk])}>
      {RISK_LABELS[risk]}
    </Badge>
  );
}
