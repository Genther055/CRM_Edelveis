import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          color: '#1e293b',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '560px',
            backgroundColor: '#ffffff',
            padding: '2.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.75rem' }}>
              Сталася помилка завантаження інтерфейсу
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Калькулятор оновлюється під нові параметри. Спробуйте оновити сторінку або очистити кеш браузера (Ctrl + F5).
            </p>
            {this.state.error && (
              <pre style={{
                backgroundColor: '#f1f5f9',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#475569',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '1.5rem'
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Перезавантажити калькулятор
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
