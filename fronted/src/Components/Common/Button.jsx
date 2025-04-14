import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Button({ variant, children, to, onClick, className, disabled }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (to) {
      navigate(to);
    }
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`uppercase font-semibold py-2 px-4 sm:px-6 md:px-8 text-sm sm:text-base inline-block transition-colors duration-300 focus:outline-none focus:ring focus:ring-offset-1 sm:focus:ring-offset-2 rounded-full ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className || 'bg-yellow-400 text-stone-800 hover:bg-yellow-300 focus:bg-yellow-300 focus:ring-yellow-300'}`}
      >
        {children}
      </button>
    );
  }

  if (variant === "navlink") {
    return (
      <div className="flex bg-white rounded-full w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto p-1 justify-between items-center mb-2">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `flex-1 text-center h-9 ml-1 sm:ml-3 px-2 sm:px-6 md:px-10 py-1 rounded-xl text-sm sm:text-base transition-colors duration-200 ${
              isActive ? "bg-yellow-400 font-medium" : "hover:bg-gray-100"
            }`
          }
        >
          Login
        </NavLink>
        <NavLink
          to="/signup"
          className={({ isActive }) =>
            `flex-1 text-center h-9 mr-1 sm:mr-3 px-2 sm:px-6 md:px-10 py-1 rounded-xl text-sm sm:text-base transition-colors duration-200 ${
              isActive ? "bg-yellow-400 font-medium" : "hover:bg-gray-100"
            }`
          }
        >
          Register
        </NavLink>
      </div>
    );
  }

  return null;
}

export default Button;
