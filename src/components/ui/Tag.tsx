/**
 * Small pill label: series names, categories, partner tiers.
 *
 * TODO: implement the variant styling (outline vs filled, accent colours).
 */

import { cn } from '@/lib/cn';

export type TagVariant = 'default' | 'accent' | 'outline';

export interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
}

export function Tag({ children, variant = 'default', className }: TagProps) {
  return <span className={cn('tag', `tag--${variant}`, className)}>{children}</span>;
}
