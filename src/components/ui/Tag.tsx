/**
 * Small mono chip: series names, result labels, the CHAMPION badge.
 *
 * Three treatments from the style guide:
 * - `default`  — neutral outline chip ("SIMULATOR", "FINAL — P8").
 * - `accent`   — cyan filled chip ("ACTIVE — GT3").
 * - `champion` — Race Red outline chip, reserved for championships.
 */

import { cn } from '@/lib/cn';

export type TagVariant = 'default' | 'accent' | 'champion';

const VARIANT_CLASSES: Record<TagVariant, string> = {
  default: 'border border-border-chip text-text-secondary',
  accent: 'bg-accent-primary text-bg',
  champion: 'border border-accent-secondary/50 text-accent-secondary',
};

export interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
}

export function Tag({ children, variant = 'default', className }: TagProps) {
  return (
    <span
      className={cn(
        'tracking-mono inline-block px-[10px] py-[6px] font-mono text-[10px] uppercase',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
