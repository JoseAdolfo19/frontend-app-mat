import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { logger } from '../../utils/logger';

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8" role="alert">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-[var(--on-surface)] mb-2">
              {t('errors.somethingWrong')}
            </h2>
            <p className="text-[var(--on-surface-variant)] mb-6 text-sm">
              {t('errors.retryDesc')}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
            >
              {t('errors.retry')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary = (props) => {
  const { t } = useLanguage();
  return <ErrorBoundaryInner {...props} t={t} />;
};

export default ErrorBoundary;
