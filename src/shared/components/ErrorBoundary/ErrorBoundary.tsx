"use client";

import React, { ReactNode } from "react";
import { handleError } from "@/lib/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for client-side React errors
 * Catches render errors and displays fallback UI
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    handleError(error, `ErrorBoundary: ${errorInfo.componentStack}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: "2rem",
              backgroundColor: "#fee",
              border: "1px solid #f99",
              borderRadius: "0.5rem",
              color: "#c00",
            }}
          >
            <h2>Something went wrong</h2>
            <details style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>
              {this.state.error?.toString()}
            </details>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
