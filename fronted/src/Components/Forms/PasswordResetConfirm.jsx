import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        `http://localhost:8000/auth/user/password-reset/${uid}/${token}/`,
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
    <div className="reset-password">
      <h2>Reset Your Password</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="new_password">New Password:</label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="re_new_password">Confirm New Password:</label>
          <input
            type="password"
            id="re_new_password"
            name="re_new_password"
            value={formData.re_new_password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default PasswordResetConfirm;