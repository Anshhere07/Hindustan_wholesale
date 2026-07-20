import React from 'react';
import styles from './Card.module.css';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// Card — surface container with variants, hover effects, and section slots
// ─────────────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  className?: string;
  as?: React.ElementType;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  className,
  as: Tag = 'div',
  onClick,
}) => (
  <Tag
    className={cn(
      styles.card,
      styles[`card--${variant}`],
      styles[`card--pad-${padding}`],
      (hover || clickable) && styles['card--hover'],
      clickable && styles['card--clickable'],
      className
    )}
    onClick={onClick}
    role={clickable ? 'button' : undefined}
    tabIndex={clickable ? 0 : undefined}
    onKeyDown={clickable && onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
  >
    {children}
  </Tag>
);

// ── Card sub-components ───────────────────────────────────────────────────────
interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardSectionProps> = ({ children, className }) => (
  <div className={cn(styles.header, className)}>{children}</div>
);

export const CardBody: React.FC<CardSectionProps> = ({ children, className }) => (
  <div className={cn(styles.body, className)}>{children}</div>
);

export const CardFooter: React.FC<CardSectionProps> = ({ children, className }) => (
  <div className={cn(styles.footer, className)}>{children}</div>
);

export default Card;
