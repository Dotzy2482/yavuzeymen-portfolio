/**
 * A single headline figure with a label — wins, podiums, follower counts.
 *
 * Always renders through the `.num` utility so digits are tabular and the
 * layout does not jitter while a CountUp is running.
 *
 * TODO: implement sizing variants and the accent treatment.
 * TODO: hook up CountUp when `animate` is true.
 */

import { cn } from '@/lib/cn';

export interface StatValueProps {
  /** The figure itself. Accepts a string so `'1:42.318'` works too. */
  value: string | number;
  label: string;
  /** Rendered before the value, e.g. `'+'`. */
  prefix?: string;
  /** Rendered after the value, e.g. `'K'`, `'%'`. */
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Count up from zero when the stat scrolls into view. */
  animate?: boolean;
  className?: string;
}

export function StatValue({
  value,
  label,
  prefix,
  suffix,
  size = 'md',
  animate = false,
  className,
}: StatValueProps) {
  // TODO: `animate` currently does nothing — swap in <CountUp /> here.
  void animate;

  return (
    <div className={cn('stat-value', `stat-value--${size}`, className)}>
      <span className="num">
        {prefix}
        {value}
        {suffix}
      </span>
      <span className="text-text-muted">{label}</span>
    </div>
  );
}
