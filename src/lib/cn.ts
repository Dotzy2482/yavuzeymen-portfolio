/**
 * Conditional className joiner.
 *
 * Deliberately dependency-free: no clsx, no tailwind-merge. If genuine class
 * conflict resolution turns out to be necessary, revisit — but the components
 * should be structured so that it is not.
 */

export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
