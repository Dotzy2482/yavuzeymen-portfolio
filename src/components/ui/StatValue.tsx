/**
 * A single headline figure with a mono label above it — iRating, license,
 * counters.
 *
 * Always renders through the `.num` utility so digits are tabular and the
 * layout does not jitter while a CountUp is running.
 */

import { cn } from '@/lib/cn';
import { CountUp } from '@/components/motion/CountUp';

import { MonoLabel } from './MonoLabel';

const SIZE_CLASSES = {
  sm: 'text-[20px] md:text-[22px]',
  md: 'text-[40px]',
  lg: 'text-[34px] md:text-[clamp(36px,3.6vw,56px)]',
} as const;

export interface StatValueProps {
  /** The figure itself. Accepts a string so `'A 1.39'` works too. */
  value: string | number;
  label: string;
  /** Rendered before the value, e.g. `'%'`. */
  prefix?: string;
  /** Rendered after the value, e.g. `'K'`. */
  suffix?: string;
  size?: keyof typeof SIZE_CLASSES;
  /** Render the value in Signal Cyan. */
  accent?: boolean;
  /** Count up from zero when the stat scrolls into view (numbers only). */
  animate?: boolean;
  /** Decimal places while counting. */
  decimals?: number;
  className?: string;
}

export function StatValue({
  value,
  label,
  prefix,
  suffix,
  size = 'sm',
  accent = false,
  animate = false,
  decimals = 0,
  className,
}: StatValueProps) {
  return (
    <div className={className}>
      <MonoLabel size="xs" tracking="lg" as="div">
        {label}
      </MonoLabel>
      <div
        className={cn(
          'num mt-1.5 font-medium md:mt-2.5',
          SIZE_CLASSES[size],
          accent ? 'text-accent-primary' : 'text-text',
        )}
      >
        {animate && typeof value === 'number' ? (
          <CountUp to={value} decimals={decimals} prefix={prefix} suffix={suffix} />
        ) : (
          <>
            {prefix}
            {value}
            {suffix}
          </>
        )}
      </div>
    </div>
  );
}
