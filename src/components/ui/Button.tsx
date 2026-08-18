/**
 * The site's only button. Renders an <a> when `href` is given, otherwise a
 * <button> — so a "link that looks like a button" never becomes a button that
 * behaves like a link.
 *
 * Variants map onto the style guide:
 * - `primary`   — Race Red CTA ("Business Enquiries →"). Red never hovers to
 *                 cyan; it brightens to its own hover tone.
 * - `secondary` — 1px outline, hovers to cyan.
 * - `ghost`     — mono underline link ("All achievements →"), hovers to cyan.
 */

import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-secondary text-text font-extrabold stretch-ui tracking-btn hover:bg-accent-secondary-hover',
  secondary:
    'border border-border-btn text-text font-bold tracking-btn hover:border-accent-primary hover:text-accent-primary',
  ghost:
    'font-mono text-text-secondary tracking-label border-b border-border-btn hover:text-accent-primary hover:border-accent-primary',
};

const SIZE_CLASSES: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: {
    sm: 'text-[13px] px-[26px] py-[15px]',
    md: 'text-[14px] px-7 py-[18px]',
    lg: 'text-[14px] px-[34px] py-[19px]',
  },
  secondary: {
    sm: 'text-[13px] px-[26px] py-[14px]',
    md: 'text-[14px] px-7 py-[17px]',
    lg: 'text-[14px] px-[34px] py-[18px]',
  },
  ghost: {
    sm: 'text-[11px] py-2',
    md: 'text-[12px] py-3',
    lg: 'text-[13px] py-3',
  },
};

interface ButtonBaseProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export interface ButtonAsButtonProps
  extends
    ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  href?: undefined;
}

export interface ButtonAsLinkProps
  extends
    ButtonBaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> {
  href: string;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className } = props;
  const classes = cn(
    'inline-flex cursor-pointer items-center gap-3 uppercase transition-colors duration-[250ms] whitespace-nowrap',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[variant][size],
    className,
  );

  if (props.href !== undefined) {
    const { children: _children, variant: _v, size: _s, className: _c, ...anchorProps } = props;
    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { children: _children, variant: _v, size: _s, className: _c, ...buttonProps } = props;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
