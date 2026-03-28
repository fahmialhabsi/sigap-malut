// frontend/src/components/ErrorBoundary.jsx
// React Error Boundary — tangkap runtime error di subtree dashboard
// tanpa merusak seluruh halaman.

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log ke console — bisa diganti dengan error tracking service
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (fallback) return fallback;

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center min-h-[200px] p-8 bg-red-50 border border-red-200 rounded-xl text-center gap-4"
        >
          <span className="text-4xl" aria-hidden="true">⚠️</span>
          <div>
            <p className="font-semibold text-red-800 text-lg">
              Terjadi kesalahan pada halaman ini
            </p>
            <p className="text-sm text-red-600 mt-1">
              {this.state.error?.message || "Error tidak diketahui."}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
