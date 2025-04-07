import React from 'react';

/**
 * Reusable loading spinner component
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the loader (sm, md, lg)
 * @param {string} props.color - Color of the loader (primary, secondary, white)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Loader component
 */
const Loader = ({ size = 'md', color = 'primary', className = '' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Color classes
  const colorClasses = {
    primary: 'text-green-600',
    secondary: 'text-yellow-500',
    white: 'text-white',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-t-2 border-b-2 ${colorClasses[color]} ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
