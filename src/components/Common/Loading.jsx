import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--primary)]/20 rounded-full animate-spin border-t-[var(--primary)]"></div>
          <div className="mt-4 text-[var(--on-surface-variant)] font-medium">
            Cargando...
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;