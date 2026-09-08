import React from 'react';
import { FiBookOpen } from 'react-icons/fi';

const EmptyState = ({ icon, title, message, action }) => {
  return (
    <div className="text-center py-5">
      <div className="mb-3" style={{ fontSize: '3rem', color: '#6c757d' }}>
        {icon || <FiBookOpen size={64} />}
      </div>
      <h5 className="text-muted">{title || 'No data found'}</h5>
      <p className="text-secondary">{message || 'There is nothing to display here yet.'}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
};

export default EmptyState;
