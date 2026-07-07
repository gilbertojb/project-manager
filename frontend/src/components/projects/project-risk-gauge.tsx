import { useId } from 'react';
import { RISK_LABELS, type RiskLevel } from '@/types/project';
import { ProjectRiskBadge } from './project-risk-badge';

const RISK_SCORE: Record<RiskLevel, number> = {
  low: 25,
  medium: 60,
  high: 85,
};

const RISK_GRADIENT: Record<RiskLevel, [string, string]> = {
  low: ['#34d399', '#10b981'],
  medium: ['#fbbf24', '#f97316'],
  high: ['#f97316', '#ef4444'],
};

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Arco de 270° (3/4 do círculo), com abertura voltada para baixo
const TRACK_LENGTH = CIRCUMFERENCE * 0.75;

interface ProjectRiskGaugeProps {
  risk: RiskLevel;
}

export function ProjectRiskGauge({ risk }: ProjectRiskGaugeProps) {
  const gradientId = useId();
  const score = RISK_SCORE[risk];
  const [fromColor, toColor] = RISK_GRADIENT[risk];
  const arcLength = (score / 100) * TRACK_LENGTH;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-44 w-44">
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full"
          role="img"
          aria-label={`Nível de risco: ${RISK_LABELS[risk]} (${score} de 100)`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={fromColor} />
              <stop offset="100%" stopColor={toColor} />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${TRACK_LENGTH} ${CIRCUMFERENCE}`}
            transform="rotate(135 100 100)"
            className="stroke-muted dark:stroke-zinc-800"
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            strokeWidth="14"
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
            strokeDasharray={`${arcLength} ${CIRCUMFERENCE}`}
            transform="rotate(135 100 100)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tight">{score}</span>
          <span className="mt-1 text-sm text-muted-foreground">
            Nível de Risco
          </span>
        </div>
      </div>
      <ProjectRiskBadge risk={risk} />
    </div>
  );
}
