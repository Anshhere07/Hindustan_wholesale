// ─────────────────────────────────────────────────────────────────────────────
// Class name utility — merges conditional class names (no runtime overhead)
// ─────────────────────────────────────────────────────────────────────────────

type ClassValue = string | undefined | null | boolean | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  return classes
    .flat(Infinity as 0)
    .filter((c): c is string => typeof c === 'string' && c.length > 0)
    .join(' ');
}
