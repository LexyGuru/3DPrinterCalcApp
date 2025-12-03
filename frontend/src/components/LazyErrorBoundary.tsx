import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import type { Settings } from "../types";

interface Props {
  children: ReactNode;
  settings?: Settings;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary specifikusan lazy-loaded komponensekhez.
 * Ez külön kezeli a lazy komponens betöltési hibákat.
 */
export class LazyErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    if (import.meta.env.DEV) {
      console.error("LazyErrorBoundary caught an error:", error, errorInfo);
    }

    // Call onError callback if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        console.error("Error in LazyErrorBoundary onError callback:", callbackError);
      }
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Force reload the lazy component
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const language = this.props.settings?.language || "hu";
      const t = (key: string) => {
        // Simple translation fallback
        const translations: Record<string, Record<string, string>> = {
          "lazyError.title": {
            hu: "Komponens betöltési hiba",
            en: "Component loading error",
            de: "Komponentenladefehler",
            es: "Error de carga del componente",
            fr: "Erreur de chargement du composant",
            it: "Errore di caricamento del componente",
            pl: "Błąd ładowania komponentu",
            cs: "Chyba načítání komponenty",
            sk: "Chyba načítania komponenty",
            pt: "Erro ao carregar componente",
            ru: "Ошибка загрузки компонента",
            uk: "Помилка завантаження компонента",
            zh: "组件加载错误"
          },
          "lazyError.message": {
            hu: "A komponens betöltése során hiba történt. Kérlek, próbáld újra.",
            en: "An error occurred while loading the component. Please try again.",
            de: "Beim Laden der Komponente ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
            es: "Ocurrió un error al cargar el componente. Por favor, inténtalo de nuevo.",
            fr: "Une erreur s'est produite lors du chargement du composant. Veuillez réessayer.",
            it: "Si è verificato un errore durante il caricamento del componente. Riprova.",
            pl: "Wystąpił błąd podczas ładowania komponentu. Spróbuj ponownie.",
            cs: "Při načítání komponenty došlo k chybě. Zkuste to prosím znovu.",
            sk: "Pri načítaní komponenty došlo k chybe. Skúste to prosím znova.",
            pt: "Ocorreu um erro ao carregar o componente. Por favor, tente novamente.",
            ru: "Произошла ошибка при загрузке компонента. Пожалуйста, попробуйте снова.",
            uk: "Сталася помилка під час завантаження компонента. Будь ласка, спробуйте ще раз.",
            zh: "加载组件时发生错误。请重试。"
          },
          "lazyError.retry": {
            hu: "Újrapróbálás",
            en: "Retry",
            de: "Wiederholen",
            es: "Reintentar",
            fr: "Réessayer",
            it: "Riprova",
            pl: "Spróbuj ponownie",
            cs: "Zkusit znovu",
            sk: "Skúsiť znova",
            pt: "Tentar novamente",
            ru: "Повторить",
            uk: "Спробувати ще раз",
            zh: "重试"
          }
        };
        return translations[key]?.[language] || translations[key]?.["en"] || key;
      };

      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          padding: "40px",
          textAlign: "center",
          backgroundColor: this.props.settings?.theme === "dark" ? "#1a1a1a" : "#ffffff",
          color: this.props.settings?.theme === "dark" ? "#ffffff" : "#000000"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>⚠️</div>
          <h2 style={{ 
            color: "#dc3545", 
            marginBottom: "16px",
            fontSize: "24px"
          }}>
            {t("lazyError.title")}
          </h2>
          <p style={{ 
            color: "#6c757d", 
            marginBottom: "24px", 
            maxWidth: "500px",
            fontSize: "16px",
            lineHeight: "1.5"
          }}>
            {t("lazyError.message")}
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ 
              marginTop: "20px", 
              padding: "16px", 
              backgroundColor: this.props.settings?.theme === "dark" ? "#2a2a2a" : "#f8f9fa", 
              borderRadius: "8px",
              maxWidth: "600px",
              textAlign: "left",
              width: "100%"
            }}>
              <summary style={{ 
                cursor: "pointer", 
                fontWeight: "600", 
                marginBottom: "8px",
                color: this.props.settings?.theme === "dark" ? "#ffffff" : "#000000"
              }}>
                Hiba részletei (csak fejlesztési módban)
              </summary>
              <pre style={{ 
                fontSize: "12px", 
                overflow: "auto",
                color: "#dc3545",
                marginTop: "8px"
              }}>
                {this.state.error.toString()}
                {this.state.error.stack}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              marginTop: "20px",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0056b3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#007bff";
            }}
          >
            {t("lazyError.retry")}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

