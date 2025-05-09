import React from 'react';

/**
 * LoadingSpinner Component
 * Displays a loading spinner with customizable size
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner: 'small', 'medium', or 'large'
 * @param {string} props.color - Color of the spinner (default: 'green')
 */
function LoadingSpinner({ size = 'medium', color = 'green' }) {
  // Determine size class based on the size prop
  const sizeClass = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }[size] || 'w-8 h-8';
  
  // Determine color class based on the color prop
  const colorClass = {
    green: 'text-green-500',
    blue: 'text-blue-500',
    gray: 'text-gray-500',
    red: 'text-red-500'
  }[color] || 'text-green-500';

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClass} ${colorClass} animate-spin`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  );
}

export default LoadingSpinner;
