import React from 'react';

const LoadingDots = () => {
  return (
    <div className="flex space-x-1">
      <span className="text-2xl animate-dot-pulse" style={{ animationDelay: '0s' }}>
        .
      </span>
      <span className="text-2xl animate-dot-pulse" style={{ animationDelay: '0.2s' }}>
        .
      </span>
      <span className="text-2xl animate-dot-pulse" style={{ animationDelay: '0.4s' }}>
        .
      </span>
    </div>
  );
};

export default LoadingDots;
