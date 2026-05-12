import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4" role="alert">
          <div className="text-center max-w-md">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-brand-red" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Đã xảy ra lỗi
            </h1>
            <p className="text-gray-600 mb-8">
              Ứng dụng gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-red text-white rounded-lg hover:bg-brand-red-700 transition-colors min-h-touch"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Tải lại trang
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-touch"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
