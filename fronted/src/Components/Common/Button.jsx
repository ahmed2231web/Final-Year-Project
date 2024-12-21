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
        className={`uppercase font-semibold py-2 px-11 inline-block transition-colors duration-300 focus:outline-none focus:ring focus:ring-offset-2 rounded-full ${className || 'bg-yellow-400 text-stone-800 hover:bg-yellow-300 focus:bg-yellow-300 focus:ring-yellow-300'}`}
      >
        {children}
      </button>
    );
  }

  if (variant === "navlink") {
    return (
      <div className="flex bg-white rounded-full w-80 mx-auto p-1 justify-between items-center mb-2">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `w-[20] h-9 ml-3 px-10 py-1 rounded-xl ${
              isActive ? "bg-yellow-400" : ""
            }`
          }
        >
          Login
        </NavLink>
        <NavLink
          to="/signup"
          className={({ isActive }) =>
            `w-[20] h-9 mr-4 px-10 py-1 rounded-xl ${
              isActive ? "bg-yellow-400" : ""
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
