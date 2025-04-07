import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../../Components/Common/Button";
import authService from "../../Services/authService";
import { toast } from "react-hot-toast";

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to intended page after login
  const from = location.state?.from || "/";

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Check user type and redirect accordingly
          const userType = await authService.getUserType();
          if (userType === 'FARMER') {
            navigate('/farmer/dashboard');
          } else if (userType === 'CUSTOMER') {
            // Redirect customers to customer dashboard
            navigate('/customer/dashboard');
          } else if (userType === 'ADMIN') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        } catch (err) {
          console.error("Error getting user type:", err);
          navigate('/');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

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
      // Pass email and password separately to the login function
      await authService.login(formData.email, formData.password);
      
      setFormData({ email: "", password: "" });
      toast.success("Login successful!");
      
      // Dispatch auth state change event
      window.dispatchEvent(new Event('auth-state-change'));
      
      // Get user type and redirect accordingly
      const userType = await authService.getUserType();
      console.log("User type:", userType);
      
      if (userType === 'FARMER') {
        navigate('/farmer/dashboard');
      } else if (userType === 'CUSTOMER') {
        // Redirect customers to customer dashboard
        navigate('/customer/dashboard');
      } else if (userType === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate(from);
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data) {
        const errorMessage = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("\n");
        setError(errorMessage);
        toast.error("Login failed. Please check your credentials.");
      } else {
        setError("Failed to login. Please check your credentials and try again.");
        toast.error("Login failed. Please try again.");
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

      <div>
        <label htmlFor="email" className="block text-sm font-normal text-white mb-3">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full max-w-xl rounded-full border border-stone-200 px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-normal text-white mb-3">
          Password
        </label>
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

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <Link to="/forgot-password" className="font-medium text-white hover:text-green-300">
            Forgot your password?
          </Link>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="button" className="bg-yellow-400" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-300">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-white hover:text-green-300">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
}

export default LoginForm;