import { Component, ErrorInfo, ReactNode } from "react";
import { cvData } from "../data/portfolioFacts";
import { reportError } from "../lib/reportError";

/**
 * The last thing between a render error and a blank page.
 *
 * React unmounts the whole tree when a render throws and nothing catches
 * it, so a single bad value anywhere below would leave a visitor looking at
 * an empty document with no error, no explanation and nothing to click.
 *
 * The fallback is not an apology screen. This site exists so that somebody
 * can find out who this is and get in touch, and it should still do that
 * when it is broken: the name, one honest sentence, and the same contact
 * details the CV carries, read from the same data the page uses.
 */

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Called with the error, so a test can assert it was not swallowed. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  failed: boolean;
}

const LINK_CLASS =
  "text-cyan-400 underline underline-offset-4 hover:text-cyan-300 focus-ring rounded-sm";

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Reported rather than swallowed. Without this the only trace of a
    // failure is the fallback itself, which says nothing about the cause.
    reportError(error, "render", { fatal: true });
    console.error(info.componentStack);
    this.props.onError?.(error, info);
  }

  override render() {
    if (!this.state.failed) return this.props.children;

    const { name, email, phone, linkedin } = cvData.header;

    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex items-center justify-center px-6 py-16">
        <main className="w-full max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            {name}
          </h1>

          <p className="text-slate-400 mb-8">
            Something on this page failed to load. The details below are
            current either way.
          </p>

          <ul className="space-y-3 text-lg">
            <li>
              <a className={LINK_CLASS} href={`mailto:${email.href}`}>
                {email.display.join("")}
              </a>
            </li>
            <li>
              <a className={LINK_CLASS} href={`tel:${phone.href}`}>
                {phone.display.join("")}
              </a>
            </li>
            <li>
              <a
                className={LINK_CLASS}
                href={`https://${linkedin}`}
                rel="noopener noreferrer"
              >
                {linkedin}
              </a>
            </li>
          </ul>

          <p className="mt-10">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg border border-white/15 text-slate-200 hover:bg-white/5 focus-ring transition-colors"
            >
              Try loading the page again
            </button>
          </p>
        </main>
      </div>
    );
  }
}

export default ErrorBoundary;
