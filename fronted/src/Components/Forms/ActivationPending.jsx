// src/components/forms/ActivationPending.jsx
import React from "react";
import { Link } from "react-router-dom";

function ActivationPending() {
  return (
    <div className="activation-pending">
      <h2>Activation Pending</h2>
      <p>Please check your email to activate your account.</p>
      <p>If you didn't receive the email, <Link to="/resend-activation">click here to resend</Link>.</p>
    </div>
  );
}

export default ActivationPending;