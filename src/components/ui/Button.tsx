import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500',
      outline: 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 cursor-pointer hover:shadow-sm focus:ring-blue-500'
    };
    
    const sizes = {
      sm: 'py-2 px-4 text-xs',
      md: 'py-3.5 px-6 text-sm',
      lg: 'py-4 px-8 text-base'
    };
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';
