import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, fullWidth = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';
    
    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm dark:bg-brand-600 dark:hover:bg-brand-500 dark:text-white',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      outline: 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm',
      glass: 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white hover:bg-white/80 dark:hover:bg-slate-900/80 shadow-sm'
    };
    
    const sizes = {
      sm: 'h-9 px-4 text-xs rounded-lg',
      md: 'h-11 px-6 text-sm rounded-xl',
      lg: 'h-14 px-8 text-base rounded-2xl',
      icon: 'h-11 w-11 rounded-xl'
    };
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles} 
          ${variants[variant]} 
          ${sizes[size]} 
          ${fullWidth ? 'w-full' : ''} 
          ${className}
        `}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
