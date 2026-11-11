import React from 'react';
import { SearchX, Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No records found',
  description = 'Try adjusting your search criteria or filter selections to find what you are looking for.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 my-4">
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs mb-3">
        <Icon className="w-6 h-6 text-brand-primary/60" />
      </div>
      <h4 className="text-sm font-semibold text-brand-navy">{title}</h4>
      <p className="text-xs text-slate-muted max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

