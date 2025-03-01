import React, { forwardRef } from 'react';

const InputProduct = forwardRef(function InputProduct({ id, type, placeholder, label, error, ...rest }, ref) {
  return (
    <div className="flex items-center space-x-4 w-full">
      <label htmlFor={id} className="font-semibold w-1/4">
        {label}
      </label>
      <input
        className="w-1/2 px-4 py-2 border rounded-md"
        id={id}
        type={type}
        placeholder={placeholder}
        ref={ref}
        {...rest}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
});

export default InputProduct;
