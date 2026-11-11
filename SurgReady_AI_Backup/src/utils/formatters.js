// Formatting utilities for medical metrics, currency, and IDs

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

export const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'verified':
    case 'in stock':
    case 'cleared':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'in progress':
    case 'low stock':
    case 'urgent':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'pending review':
    case 'pending':
    case 'emergency':
    case 'critical':
    case 'out of stock':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

export const getPriorityBadgeStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'emergency':
      return 'bg-rose-100 text-rose-800 font-semibold border-rose-300 animate-pulse';
    case 'urgent':
      return 'bg-amber-100 text-amber-800 font-medium border-amber-300';
    case 'elective':
    default:
      return 'bg-blue-100 text-blue-800 font-medium border-blue-200';
  }
};

