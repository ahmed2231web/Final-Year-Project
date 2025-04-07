// src/components/forms/ActivateAccount.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_DOMAIN;

// Helper function to get a cookie by name
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      // Check if this cookie string begins with the name we want
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function ActivateAccount() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: true, error: null, success: false });
  const [activationAttempted, setActivationAttempted] = useState(false);

  useEffect(() => {
    const activateUser = async () => {
      // Prevent multiple activation attempts
      if (activationAttempted) {
        return;
      }
      
      setActivationAttempted(true);
      
      try {
        // Use the correct endpoint and HTTP method (GET)
        const response = await axios.get(
          `${API_URL}/auth/user/activate/${uid}/${token}/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        setStatus({ loading: false, error: null, success: true });
        
        // After a successful activation, redirect the user to the login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        console.error("Activation error:", error);
        setStatus({ 
          loading: false, 
          error: "Failed to activate account. Please try again or contact support.", 
          success: false 
        });
      }
    };

    activateUser();
  }, [uid, token, navigate, activationAttempted]);

  return (
    <div className="activate-account">
      <h2>Account Activation</h2>
      {status.loading && <p>Activating your account, please wait...</p>}
      {status.error && <p className="error">{status.error}</p>}
      {status.success && (
        <div>
          <p className="success">Your account has been successfully activated!</p>
          <p>You will be redirected to the login page in a few seconds...</p>
        </div>
      )}
    </div>
  );
}

export default ActivateAccount;