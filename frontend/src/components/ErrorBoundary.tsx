import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    // Call onError callback if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        console.error("Error in ErrorBoundary onError callback:", callbackError);
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "40px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚠️</div>
          <h2 style={{ color: "#dc3545", marginBottom: "16px" }}>Hiba történt</h2>
          <p style={{ color: "#6c757d", marginBottom: "24px", maxWidth: "500px" }}>
            Elnézést, valami váratlan hiba történt. Kérlek, frissítsd az oldalt vagy próbáld újra.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ 
              marginTop: "20px", 
              padding: "16px", 
              backgroundColor: "#f8f9fa", 
              borderRadius: "8px",
              maxWidth: "600px",
              textAlign: "left"
            }}>
              <summary style={{ cursor: "pointer", fontWeight: "600", marginBottom: "8px" }}>
                Hiba részletei (csak fejlesztési módban)
              </summary>
              <pre style={{ 
                fontSize: "12px", 
                overflow: "auto",
                color: "#dc3545"
              }}>
                {this.state.error.toString()}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            Oldal frissítése
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

