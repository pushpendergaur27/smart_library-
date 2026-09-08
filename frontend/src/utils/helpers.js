export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
};

export const getStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE':
      return 'bg-success';
    case 'BORROWED':
    case 'ISSUED':
      return 'bg-warning text-dark';
    case 'OVERDUE':
      return 'bg-danger';
    case 'RESERVED':
      return 'bg-info';
    case 'MAINTENANCE':
    case 'DAMAGED':
      return 'bg-secondary';
    default:
      return 'bg-primary';
  }
};
