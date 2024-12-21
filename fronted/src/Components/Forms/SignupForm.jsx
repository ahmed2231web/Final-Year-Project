import React, { useState } from "react";
import Button from "../../Components/Common/Button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const locationData = {
  provinces: [
    { id: "punjab", name: "Punjab" },
    { id: "sindh", name: "Sindh" },
    { id: "kpk", name: "Khyber Pakhtunkhwa" },
    { id: "balochistan", name: "Balochistan" },
  ],
  cities: {
    punjab: ["Lahore", "Faisalabad", "Multan", "Rawalpindi"],
    sindh: ["Karachi", "Hyderabad", "Sukkur"],
    kpk: ["Peshawar", "Abbottabad", "Mardan"],
    balochistan: ["Quetta", "Gwadar", "Turbat"],
  },
};

const API_URL = "http://127.0.0.1:8000";

function SignUpForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
    user_type: "FARMER",
    province: "",
    city: "",
    password: "",
    re_password: ""
  });

  const [availableCities, setAvailableCities] = useState([]);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phoneNumber") {
      // Handle phone number formatting
      let formattedNumber = value;
      if (!value.startsWith('+92')) {
        formattedNumber = value.replace(/^\+92|^92|^0/g, ''); // Remove existing prefixes
        if (formattedNumber.length > 0) {
          formattedNumber = '+92' + formattedNumber;
        }
      }
      // Only allow digits after the +92 prefix
      formattedNumber = formattedNumber.replace(/[^\+\d]/g, '');
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedNumber
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (name === "province") {
      setAvailableCities(locationData.cities[value] || []);
      setFormData((prevData) => ({
        ...prevData,
        city: "",
      }));
    }

    if (name === "password") {
      validatePassword(value);
    }

    if (name === "re_password") {
      validateConfirmPassword(value);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+923\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    // Simpler password validation
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== formData.password) {
      setConfirmPasswordError("Passwords do not match.");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation before submission
    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (!validatePhone(formData.phoneNumber)) {
      alert("Please enter a valid phone number in format: +923xxxxxxxxx");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setIsLoading(false);
      return;
    }

    if (!validateConfirmPassword(formData.re_password)) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending registration request with data:", {
        ...formData,
        password: "***",
        re_password: "***"
      });

      const response = await axios.post(`${API_URL}/auth/users/`, {
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        user_type: formData.user_type,
        province: formData.province,
        city: formData.city,
        password: formData.password,
        re_password: formData.re_password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Registration response:", response);

      if (response.status === 201) {
        // Clear form
        setFormData({
          email: "",
          fullName: "",
          phoneNumber: "",
          user_type: "FARMER",
          province: "",
          city: "",
          password: "",
          re_password: ""
        });
        
        // Redirect to login page
        navigate('/login');
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response?.data) {
        const errorMessages = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        alert(`Registration failed:\n${errorMessages}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert("An unexpected error occurred during registration.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-normal text-white mb-3">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full max-w-xl rounded-full border px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />
        {!validateEmail(formData.email) && (
          <p className="text-yellow-400 text-sm">Invalid email format.</p>
        )}
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-normal text-white mb-3">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="w-full max-w-xl rounded-full border px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-normal text-white mb-3">
          Phone Number
        </label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          required
          className="w-full max-w-xl rounded-full border px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
          placeholder="+923xxxxxxxxx"
          value={formData.phoneNumber}
          onChange={handleChange}
          maxLength={13}
        />
        {formData.phoneNumber && !validatePhone(formData.phoneNumber) && (
          <p className="text-yellow-400 text-sm">Phone number must be in format: +923xxxxxxxxx</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-normal text-white mb-3">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full max-w-xl rounded-full border px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
        />
        {passwordError && <p className="text-yellow-400 text-sm">{passwordError}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="re_password" className="block text-sm font-normal text-white mb-3">
          Confirm Password
        </label>
        <input
          id="re_password"
          name="re_password"
          type="password"
          required
          className="w-full max-w-xl rounded-full border px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
          placeholder="Confirm your password"
          value={formData.re_password}
          onChange={handleChange}
        />
        {confirmPasswordError && (
          <p className="text-yellow-400 text-sm">{confirmPasswordError}</p>
        )}
      </div>

      {/* Province */}
      <div>
        <label htmlFor="province" className="block text-sm font-normal text-white mb-3">
          Province
        </label>
        <select
          id="province"
          name="province"
          required
          className="w-full max-w-xl rounded-full border px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
          value={formData.province}
          onChange={handleChange}
        >
          <option value="">Select Province</option>
          {locationData.provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="block text-sm font-normal text-white mb-3">
          City
        </label>
        <select
          id="city"
          name="city"
          required
          className="w-full max-w-xl rounded-full border px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
          value={formData.city}
          onChange={handleChange}
          disabled={!formData.province}
        >
          <option value="">Select City</option>
          {availableCities.map((city, index) => (
            <option key={index} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* User Type */}
      <div>
        <label htmlFor="user_type" className="block text-sm font-normal text-white mb-3">
          User Type
        </label>
        <select
          id="user_type"
          name="user_type"
          className="w-full max-w-xl rounded-full border px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
          value={formData.user_type}
          onChange={handleChange}
        >
          <option value="FARMER">Farmer</option>
          <option value="DOCTOR">Doctor</option>
          <option value="CUSTOMER">Customer</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button variant="button" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </Button>
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-white">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-white hover:text-green-300">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}

export default SignUpForm;