import React from 'react';

const Loader = ({ message = 'Loading...', size = 'md', fullScreen = false }) => {
  const spinnerSizeClass = size === 'sm' ? 'loader-sm' : size === 'lg' ? 'loader-lg' : 'loader-md';

  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className={`tradex-spinner ${spinnerSizeClass} mb-3`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <div className="text-secondary fw-medium fs-7 animate-pulse">{message}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-theme">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
