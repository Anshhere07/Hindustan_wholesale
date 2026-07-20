import React from 'react';
import styles from './Badge.module.css';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// Badge — status indicators, labels, counts
// ─────────────────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pill?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pill = true,
  className,
}) => (
  <span
    className={cn(
      styles.badge,
      styles[`badge--${variant}`],
      styles[`badge--${size}`],
      pill && styles['badge--pill'],
      className
    )}
  >
    {dot && <span className={styles.dot} aria-hidden="true" />}
    {children}
  </span>
);

export default Badge;

// ── Order Status Badge helper ─────────────────────────────────────────────────
import type { OrderStatus } from '@/types/order.types';

const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  draft:                { label: 'Draft',            variant: 'neutral'  },
  pending_confirmation: { label: 'Pending',          variant: 'warning'  },
  confirmed:            { label: 'Confirmed',        variant: 'info'     },
  processing:           { label: 'Processing',       variant: 'primary'  },
  shipped:              { label: 'Shipped',          variant: 'primary'  },
  out_for_delivery:     { label: 'Out for Delivery', variant: 'primary'  },
  delivered:            { label: 'Delivered',        variant: 'success'  },
  cancelled:            { label: 'Cancelled',        variant: 'danger'   },
  return_requested:     { label: 'Return Req.',      variant: 'warning'  },
  returned:             { label: 'Returned',         variant: 'neutral'  },
  refunded:             { label: 'Refunded',         variant: 'neutral'  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: BadgeSize;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
  const { label, variant } = ORDER_STATUS_MAP[status];
  return <Badge variant={variant} size={size} dot>{label}</Badge>;
};
