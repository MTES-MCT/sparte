import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Met à jour l'état pour afficher l'UI de repli lors du prochain rendu.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Vous pouvez également enregistrer l'erreur dans un service de reporting.
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez personnaliser l'UI de repli ici.
      return <h1>Quelque chose s'est mal passé.</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
