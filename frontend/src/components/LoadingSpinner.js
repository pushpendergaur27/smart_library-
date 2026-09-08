import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="text-center">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted small">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
