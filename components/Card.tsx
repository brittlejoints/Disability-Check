import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  variant?: 'default' | 'ghost' | 'glass';
}

const Card: React.FC<CardProps> = ({ children, className = '', title, variant = 'default' }) => {
  const variants = {
    default: "bg-white rounded-2xl shadow-sm border border-taupe/20",
    ghost: "bg-transparent border-none shadow-none p-0",
    glass: "bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl shadow-soft",
  };

  const selectedVariant = variants[variant];
  // Default padding is applied unless manually overridden in className
  const padding = variant === 'ghost' ? '' : 'p-6 md:p-10';

  return (
    <div className={`${selectedVariant} ${padding} ${className}`}>
      {title && (
        <h3 className="text-2xl font-serif font-medium text-burgundy mb-6 tracking-tight">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;