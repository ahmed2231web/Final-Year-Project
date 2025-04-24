// src/Components/Forms/ResendActivation.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { API_URL } from "../../config";

function ResendActivation() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    
    try {
      // Make API call to resend activation email
      const response = await axios.post(`${API_URL}/auth/user/resend-activation/`, { email });
      
      // Set success message
      setMessage(response.data.message);
      
      // Clear form
      setEmail("");
      
    } catch (err) {
      // Handle error
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-green-600 p-6 text-center">
          <motion.div 
            className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FaEnvelope className="text-green-600 text-3xl" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Resend Activation Email</h2>
        </div>
        
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {message ? (
              <div className="text-center">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  {message}
                </div>
                <Link 
                  to="/login"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 w-full"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <>
                <p className="text-gray-700 text-lg mb-6 text-center">
                  Enter your email address below to receive a new activation link.
                </p>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {isSubmitting ? "Sending..." : "Resend Activation Email"}
                  </button>
                </form>
                
                <div className="mt-6 text-center">
                  <Link 
                    to="/login"
                    className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
                  >
                    <FaArrowLeft className="mr-2" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default ResendActivation;
