import React from 'react';

function InputProduct({ label, id, register, errors, validation, type = "text", placeholder = "" }) {
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium text-gray-700">{label}</span>
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        {...register(id, validation)}
        className="input input-bordered w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
      />
      {errors[id] && (
        <span className="text-red-500 text-sm mt-1">{errors[id].message}</span>
      )}
    </div>
  );
}

export default InputProduct;
