import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../Components/Common/Button";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/auth/jwt/create/`,
        {
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 && response.data) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        
        // Clear form
        setFormData({
          phoneNumber: "",
          password: "",
        });

        // Directly redirect to home page
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data) {
        const errorMessage = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errorMessage);
      } else {
        setError('Failed to login. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {error && (
        <div className="text-red-500 text-sm bg-red-100 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Phone Number Field */}
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-normal text-white mb-3"
        >
          Phone Number
        </label>
        <div className="mt-1">
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            className="w-full max-w-xl rounded-full border border-stone-200 px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
            placeholder="+923xxxxxxxxx"
            value={formData.phoneNumber}
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

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          variant="button" 
          className="bg-yellow-400"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-sm text-gray-300">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-white hover:text-green-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
}

export default LoginForm;