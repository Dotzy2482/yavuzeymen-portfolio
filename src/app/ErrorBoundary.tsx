/**
 * Catches a render error below it and shows a branded panel instead of the
 * blank white page React leaves behind when a render throws.
 *
 * A class component because that is still the only way to implement
 * `componentDidCatch` — the alternative is a dependency, and one small class is
 * cheaper than that.
 *
 * Deliberately reusable rather than a one-off wrapper: wrapping an individual
 * section contains a failure to that section instead of taking the page with
 * it. Today only the whole tree is wrapped; if a section ever grows risky
 * enough to warrant its own boundary, it can have one.
 *
 * The fallback copy is Turkish, like the rest of the interface.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Named in the console so a report says which boundary caught it. */
  label?: string;
  /** Replaces the default panel entirely. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // No error-reporting service in a static site, so the console is the only
    // place this can go. Keep the component stack — it is the useful half.
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ''}]`, error, info);
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        className="bg-bg text-text flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center"
      >
        <p className="tracking-mono-lg text-accent-primary font-mono text-[11px] uppercase">Hata</p>
        <p className="text-text-secondary max-w-[420px] text-[15px] leading-[1.75]">
          Sayfa yüklenirken beklenmeyen bir sorun oluştu. Sayfayı yenilemeyi deneyin.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="border-border-btn text-text tracking-btn hover:border-accent-primary hover:text-accent-primary cursor-pointer border px-7 py-[17px] text-[14px] font-bold uppercase transition-colors duration-[250ms]"
        >
          Yenile
        </button>
      </div>
    );
  }
}
