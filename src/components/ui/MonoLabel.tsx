/**
 * The tracking label that recurs some forty times in the design: Martian
 * Mono, uppercase, wide letter-spacing, usually 60% white.
 *
 * Size and tracking are props (not free-form classes) so conflicting Tailwind
 * utilities never race each other in the cascade.
 */

import { cn } from '@/lib/cn';

export type MonoLabelSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type MonoLabelTracking = 'label' | 'chip' | 'mono' | 'lg' | 'xl' | '2xl' | 'sub' | 'kicker';
export type MonoLabelTone = 'secondary' | 'faint' | 'accent' | 'text';

const SIZE_CLASSES: Record<MonoLabelSize, string> = {
  xs: 'text-[9px]',
  sm: 'text-[10px]',
  md: 'text-[11px]',
  lg: 'text-[13px]',
  xl: 'text-[16px]',
};

const TRACKING_CLASSES: Record<MonoLabelTracking, string> = {
  label: 'tracking-label', // 0.14em
  chip: 'tracking-chip', // 0.16em
  mono: 'tracking-mono', // 0.18em
  lg: 'tracking-mono-lg', // 0.2em
  xl: 'tracking-mono-xl', // 0.22em
  '2xl': 'tracking-mono-2xl', // 0.24em
  sub: 'tracking-hero-sub', // 0.26em
  kicker: 'tracking-kicker', // 0.3em
};

const TONE_CLASSES: Record<MonoLabelTone, string> = {
  secondary: 'text-text-secondary',
  faint: 'text-text-faint',
  accent: 'text-accent-primary',
  text: 'text-text',
};

export interface MonoLabelProps {
  children: React.ReactNode;
  size?: MonoLabelSize;
  tracking?: MonoLabelTracking;
  tone?: MonoLabelTone;
  as?: 'span' | 'div';
  /**
   * BCP-47 tag for the label's own text. Required on English labels: the
   * document is `lang="tr"`, and Turkish casing rules turn `i` into `İ` under
   * `text-transform: uppercase`.
   */
  lang?: string;
  className?: string;
}

export function MonoLabel({
  children,
  size = 'sm',
  tracking = 'lg',
  tone = 'secondary',
  as: Tag = 'span',
  lang,
  className,
}: MonoLabelProps) {
  return (
    <Tag
      lang={lang}
      className={cn(
        'font-mono uppercase',
        SIZE_CLASSES[size],
        TRACKING_CLASSES[tracking],
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
