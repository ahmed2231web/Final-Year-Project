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
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div 
        className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-green-600 p-6 text-center">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
            {status.loading && (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            )}
            {status.error && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {status.success && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Activation</h2>
        </div>
        
        <div className="p-8">
          {status.loading && (
            <div className="text-center">
              <p className="text-gray-700 text-lg mb-4">Activating your account, please wait...</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
          
          {status.error && (
            <div className="text-center">
              <p className="text-red-600 text-lg mb-6">{status.error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 w-full"
              >
                Try Again
              </button>
            </div>
          )}
          
          {status.success && (
            <div className="text-center">
              <p className="text-green-600 text-lg font-semibold mb-2">Your account has been successfully activated!</p>
              <p className="text-gray-600 mb-6">You will be redirected to the login page in a few seconds...</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%', animation: 'shrink 3s linear forwards' }}></div>
              </div>
              <style jsx>{`
                @keyframes shrink {
                  from { width: 100%; }
                  to { width: 0%; }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivateAccount;