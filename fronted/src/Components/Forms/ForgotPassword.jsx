import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Image from '../../ui/Image';
import Button from '../../ui/Button';
import { Link } from 'react-router-dom';

// Base URL for API requests
const API_URL = import.meta.env.VITE_BACKEND_DOMAIN;

// Helper function to get a cookie by name
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const csrfToken = getCookie("csrftoken");
    
    try {
      await axios.post(`${API_URL}/auth/user/password-reset/request/`, 
        { email },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json"
          }
        }
      );
      setMessage('Password reset email sent successfully.');
      setError('');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'Failed to send reset email.');
      } else {
        setError('Network error. Please check your connection.');
      }
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0A690E] min-h-screen flex flex-col md:flex-row items-center justify-evenly">
      <Image />
      <div className="w-full max-w-md px-4 mt-10">
        <div className="text-center mb-6">
          <h2 className="text-white text-l">Forgot Password</h2>
        </div>
        <Button variant="navlink" />
        <div className="mb-4 w-full bg-[#0A690E] p-8">
          {message && <div className="text-green-500 text-sm bg-green-100 p-3 rounded-lg mb-4">{message}</div>}
          {error && <div className="text-red-500 text-sm bg-red-100 p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div>
              <label htmlFor="email" className="block text-sm font-normal text-white mb-3">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="w-full max-w-xl rounded-full border border-stone-200 px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button variant="button" className="bg-yellow-400" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300">
                Remembered your password?{' '}
                <Link to="/login" className="font-medium text-white hover:text-green-300">Login</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;