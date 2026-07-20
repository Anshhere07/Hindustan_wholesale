// ─────────────────────────────────────────────────────────────────────────────
// Formatting Utilities — currency, dates, numbers, strings
// ─────────────────────────────────────────────────────────────────────────────

import type { Currency } from '@/types/common.types';

// ── Currency ─────────────────────────────────────────────────────────────────

const CURRENCY_MAP: Record<Currency, { locale: string; symbol: string }> = {
  INR: { locale: 'en-IN', symbol: '₹' },
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
};

export function formatCurrency(
  amount: number,
  currency: Currency = 'INR',
  options?: { compact?: boolean; showSymbol?: boolean }
): string {
  const { locale, symbol } = CURRENCY_MAP[currency];
  const showSymbol = options?.showSymbol ?? true;

  if (options?.compact) {
    if (amount >= 10_00_00_000) {
      return `${showSymbol ? symbol : ''}${(amount / 10_00_00_000).toFixed(1)}Cr`;
    }
    if (amount >= 1_00_000) {
      return `${showSymbol ? symbol : ''}${(amount / 1_00_000).toFixed(1)}L`;
    }
    if (amount >= 1_000) {
      return `${showSymbol ? symbol : ''}${(amount / 1_000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

// ── Numbers ───────────────────────────────────────────────────────────────────

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-IN', options).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_00_00_000) return `${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (value >= 1_00_000) return `${(value / 1_00_000).toFixed(1)}L`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

// ── Dates ─────────────────────────────────────────────────────────────────────

export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

// ── Strings ───────────────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function toTitleCase(str: string): string {
  return str
    .split(/[\s_-]+/)
    .map(capitalize)
    .join(' ');
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function maskPhone(phone: string): string {
  return phone.replace(/(\d{2})\d+(\d{2})/, '$1*****$2');
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.charAt(0)}${'*'.repeat(local.length - 2)}${local.charAt(local.length - 1)}@${domain}`;
}

// ── GST ──────────────────────────────────────────────────────────────────────

export function calculateGst(baseAmount: number, gstRate: number): number {
  return (baseAmount * gstRate) / 100;
}

export function calculateGstInclusive(totalAmount: number, gstRate: number): {
  base: number;
  gst: number;
} {
  const base = (totalAmount * 100) / (100 + gstRate);
  return { base: Math.round(base * 100) / 100, gst: Math.round((totalAmount - base) * 100) / 100 };
}
