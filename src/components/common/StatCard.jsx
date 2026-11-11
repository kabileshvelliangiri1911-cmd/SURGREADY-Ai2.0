import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-surface-border p-5 shadow-soft transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-hover hover:border-blue-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-muted uppercase">
          {title}
        </span>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary shadow-xs">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-brand-navy tracking-tight">{value}</h4>
        {badge && <div>{badge}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center font-medium ${
                trendDirection === 'up'
                  ? 'text-status-success'
                  : trendDirection === 'down'
                  ? 'text-status-error'
                  : 'text-slate-muted'
              }`}
            >
              {trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5 mr-1" />}
              {trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {trendDirection === 'neutral' && <Minus className="w-3.5 h-3.5 mr-1" />}
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-muted truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

