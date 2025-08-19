import React from 'react';

interface MusicalChordTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'chord' | 'label' | 'roman' | 'note';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
}

export const MusicalChordText: React.FC<MusicalChordTextProps> = ({
  children,
  className = '',
  variant = 'chord',
  size = 'base'
}) => {
  const baseClasses = ' braid-label';

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const variantClasses = {
    chord: ' tracking-wider',
    label: 'tracking-wide',
    roman: 'font-serif tracking-wide',
    note: ' tracking-widest'
  };

  const combinedClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={combinedClasses}>
      {children}
    </span>
  );
};

export default MusicalChordText;