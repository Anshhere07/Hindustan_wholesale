import React from 'react';
import styles from './StatCard.module.css';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — KPI card with trend indicator, used in all dashboards
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number; // percentage, positive = up, negative = down
  trendLabel?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  className?: string;
  animate?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  icon,
  iconColor,
  iconBg,
  className,
  animate = true,
}) => {
  const trendDirection = trend === undefined ? null : trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';

  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.top}>
        <div className={styles.labelWrap}>
          <p className={styles.label}>{label}</p>
          {trendDirection !== null && trend !== undefined && (
            <span className={cn(styles.trend, styles[`trend--${trendDirection}`])}>
              {trendDirection === 'up' && <TrendingUp size={13} aria-hidden="true" />}
              {trendDirection === 'down' && <TrendingDown size={13} aria-hidden="true" />}
              {trendDirection === 'neutral' && <Minus size={13} aria-hidden="true" />}
              <span>
                {Math.abs(trend).toFixed(1)}%
              </span>
            </span>
          )}
        </div>
        {icon && (
          <div
            className={styles.iconWrap}
            style={{ background: iconBg, color: iconColor }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>

      <p className={cn(styles.value, animate && styles['value--animate'])}>{value}</p>

      <div className={styles.bottom}>
        {subValue && <p className={styles.subValue}>{subValue}</p>}
        {trendLabel && <p className={styles.trendLabel}>{trendLabel}</p>}
      </div>
    </div>
  );
};

export default StatCard;
