import React, { forwardRef } from 'react';

// Forward ref to the input element
const Input = forwardRef(function Input({ id, type, placeholder, label, error, ...rest }, ref) {
  return (
    <>
      <label htmlFor={id} className="block text-base font-normal text-white mb-3">{label}</label>
      <input
        className="w-full max-w-xl rounded-full border px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
        id={id}
        type={type}
        placeholder={placeholder}
        ref={ref}  // Pass the ref to the input element
        {...rest}  // Spread other props (like validation)
      />
      {error && <span className="text-yellow-500 text-sm font-normal m-4">{error}</span>} {/* Display error if there's one */}
    </>
  );
});

export default Input;
