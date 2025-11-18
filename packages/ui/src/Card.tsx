import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-xl bg-white';
    
    const variantStyles = {
      default: 'shadow-sm',
      elevated: 'shadow-lg',
      outlined: 'border border-gray-200',
    };
    
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };
    
    const hoverStyles = hoverable
      ? 'transition-shadow duration-200 hover:shadow-md cursor-pointer'
      : '';
    
    const combinedClassName = [
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      hoverStyles,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    
    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

// Card sub-components for better composition
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={['mb-4', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </div>
    );
  }
);

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <h3 ref={ref} className={['text-lg font-semibold text-gray-900', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </h3>
    );
  }
);

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <p ref={ref} className={['text-sm text-gray-500', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </p>
    );
  }
);

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={['mt-4 pt-4 border-t border-gray-100', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
