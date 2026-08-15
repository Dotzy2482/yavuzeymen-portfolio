/**
 * The site's only button. Renders an <a> when `href` is given, otherwise a
 * <button> — so a "link that looks like a button" never becomes a button that
 * behaves like a link.
 *
 * TODO: implement variant and size styling.
 * TODO: add the hover/press motion treatment.
 */

import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

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
  const classes = cn('btn', `btn--${variant}`, `btn--${size}`, className);

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
