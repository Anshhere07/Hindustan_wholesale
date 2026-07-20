import React from 'react';
import styles from './Avatar.module.css';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// Avatar — user/company image with initials fallback
// ─────────────────────────────────────────────────────────────────────────────

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarShape = 'circle' | 'rounded';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
  alt?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    '#bd1b13','#991410','#0891b2','#0d9488','#059669',
    '#d97706','#dc2626','#db2777','#2563eb','#65a30d',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  shape = 'circle',
  status,
  className,
  alt,
}) => {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <span
      className={cn(
        styles.avatar,
        styles[`avatar--${size}`],
        styles[`avatar--${shape}`],
        className
      )}
      role="img"
      aria-label={alt ?? name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? name} className={styles.image} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <span className={styles.initials} style={{ background: bgColor }}>
          {initials}
        </span>
      )}
      {status && (
        <span
          className={cn(styles.status, styles[`status--${status}`])}
          aria-label={`Status: ${status}`}
        />
      )}
    </span>
  );
};

// ── AvatarGroup ───────────────────────────────────────────────────────────────
interface AvatarGroupProps {
  avatars: Pick<AvatarProps, 'src' | 'name'>[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'sm',
  className,
}) => {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={cn(styles.group, className)}>
      {visible.map((a, i) => (
        <Avatar key={i} {...a} size={size} className={styles.groupItem} />
      ))}
      {overflow > 0 && (
        <span className={cn(styles.avatar, styles[`avatar--${size}`], styles['avatar--circle'], styles.overflow)}>
          +{overflow}
        </span>
      )}
    </div>
  );
};

export default Avatar;

