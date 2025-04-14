// src/components/forms/ActivationPending.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaRedo } from "react-icons/fa";

function ActivationPending() {
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
          <h2 className="text-2xl font-bold text-white mb-2">Activation Pending</h2>
        </div>
        
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-gray-700 text-lg mb-6 text-center">
              Please check your email to activate your account.
            </p>
            
            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-600 text-center mb-6">
                If you didn't receive the email, you can request a new activation link.
              </p>
              
              <Link 
                to="/resend-activation"
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 w-full"
              >
                <FaRedo className="text-white" />
                Resend Activation Email
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default ActivationPending;