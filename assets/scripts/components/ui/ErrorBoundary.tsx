import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Met à jour l'état pour afficher l'UI de repli lors du prochain rendu.
    return { hasError: true, error: _ };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Intégration Sentry à ajouter ici
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="vw-100 vh-100 d-flex flex-column justify-content-center align-items-center">
          <h3>Une erreur s'est produite.</h3>
          {this.state.error && <p>{this.state.error.message}</p>}
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
