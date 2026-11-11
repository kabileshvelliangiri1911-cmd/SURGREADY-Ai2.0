import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  badge,
  footer,
  padding = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-surface-border shadow-soft transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-card hover:border-blue-200' : ''
      } ${className}`}
    >
      {(title || subtitle || actions || badge) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border/70">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-semibold text-brand-navy tracking-tight">{title}</h3>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && <p className="text-xs text-slate-muted mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-surface-border rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
};

