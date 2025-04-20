import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Image from '../../ui/Image';
import Button from '../../ui/Button';
import { Link } from 'react-router-dom';

// Base URL for API requests
const API_URL = import.meta.env.VITE_BACKEND_DOMAIN;

// Helper function to get a cookie by name (same as in ForgotPassword)
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

const PasswordResetConfirm = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    re_new_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Validate that the passwords match
    if (formData.new_password !== formData.re_new_password) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const csrfToken = getCookie("csrftoken");

    try {
      await axios.post(
        `${API_URL}/auth/user/password-reset/${uid}/${token}/`,
        {
          new_password: formData.new_password,
        //   re_new_password: formData.re_new_password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
        }
      );
      setMessage("Your password has been reset successfully. Please log in.");
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.response && err.response.data) {
        const errorMessage = Object.entries(err.response.data)
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
          )
          .join('\n');
        setError(errorMessage);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0A690E] min-h-screen flex flex-col md:flex-row items-center justify-evenly">
      <Image />
      <div className="w-full max-w-md px-4 mt-10">
        <div className="text-center mb-6">
          <h2 className="text-white text-l">Reset Your Password</h2>
        </div>
        <Button variant="navlink" />
        <div className="mb-4 w-full bg-[#0A690E] p-8">
          {message && <div className="text-green-500 text-sm bg-green-100 p-3 rounded-lg mb-4">{message}</div>}
          {error && <div className="text-red-500 text-sm bg-red-100 p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div>
              <label htmlFor="new_password" className="block text-sm font-normal text-white mb-3">New Password:</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                required
                value={formData.new_password}
                onChange={handleChange}
                className="w-full max-w-xl rounded-full border border-stone-200 px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label htmlFor="re_new_password" className="block text-sm font-normal text-white mb-3">Confirm New Password:</label>
              <input
                type="password"
                id="re_new_password"
                name="re_new_password"
                required
                value={formData.re_new_password}
                onChange={handleChange}
                className="w-full max-w-xl rounded-full border border-stone-200 px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="button" className="bg-yellow-400" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
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

export default PasswordResetConfirm;