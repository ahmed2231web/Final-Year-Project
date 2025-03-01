import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../ui/Button"
// import { supabase } from "../../Services/supabase";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
    
      if (error) {
        throw error;
      }
      
      // Store the token in localStorage
      localStorage.setItem('token', JSON.stringify(data));
      
      // Set the token state if needed
      console.log(data);
      
      // Redirect to home after successful login
      navigate('/');
    } catch (error) {
      console.error("Login error:", error.message);  // Log any error that occurs during login
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full"
    >
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-normal text-white mb-3"
        >
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full max-w-xl rounded-full border border-stone-200 px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-normal text-white mb-3"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full max-w-xl rounded-full border border-stone-200 px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-300"
          >
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-white hover:text-green-300"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
      {/* Email and Password Fields */}
      {/* Submit Button */}
      <div className="flex justify-end">
      <Button variant="button" className="bg-yellow-400">Login</Button>
      </div>
    </form>
  );
}

export default LoginForm;
