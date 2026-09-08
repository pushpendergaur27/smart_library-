import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

const AlertMessage = ({ variant = 'info', message, duration = 5000, onDismiss }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  if (!show || !message) return null;

  return (
    <Alert
      variant={variant}
      dismissible={!!onDismiss}
      onClose={() => {
        setShow(false);
        onDismiss?.();
      }}
    >
      {message}
    </Alert>
  );
};

export default AlertMessage;
