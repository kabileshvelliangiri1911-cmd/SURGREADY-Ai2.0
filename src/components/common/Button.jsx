import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    xs: 'px-2.5 py-1 text-xs gap-1.5',
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-4 py-2 text-sm gap-2 shadow-sm',
    lg: 'px-5 py-2.5 text-base gap-2.5 shadow',
  };

  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-blue-700 focus:ring-brand-primary/40 border border-transparent shadow-brand-primary/20',
    navy: 'bg-brand-navy text-white hover:bg-slate-800 focus:ring-brand-navy/40 border border-transparent',
    secondary: 'bg-brand-light text-brand-primary hover:bg-blue-100 focus:ring-brand-primary/30 border border-blue-200/60',
    outline: 'bg-white text-slate-text hover:bg-surface-hover border border-surface-border focus:ring-brand-primary/30',
    ghost: 'bg-transparent text-slate-muted hover:text-slate-text hover:bg-surface-hover focus:ring-brand-primary/20',
    danger: 'bg-status-error text-white hover:bg-red-700 focus:ring-status-error/40 border border-transparent',
    success: 'bg-status-success text-white hover:bg-emerald-700 focus:ring-status-success/40 border border-transparent',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

