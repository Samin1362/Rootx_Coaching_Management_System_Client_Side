import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { signInUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      // Sign in user with Firebase
      await signInUser(formData.email, formData.password);

      // Show success message
      setSuccess(true);

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate("/dashboard/overview");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);

      // Handle specific Firebase errors
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please register first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address format");
      } else if (err.code === "auth/user-disabled") {
        setError("This account has been disabled. Please contact support.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
          <FaSignInAlt className="text-2xl sm:text-3xl text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-base-content mb-2 wrap-break-word">
          Welcome Back
        </h2>
        <p className="text-sm sm:text-base text-base-content/60 px-2 wrap-break-word">
          Sign in to continue to your dashboard
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success mb-4">
          <FaCheckCircle className="text-lg shrink-0" />
          <span className="text-sm sm:text-base">
            Login successful! Redirecting...
          </span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-4">
          <FaExclamationCircle className="text-lg shrink-0" />
          <span className="text-sm sm:text-base">{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Email Input */}
        <div className="form-control">
          <label className="label px-0">
            <span className="label-text font-medium flex items-center gap-2 text-sm sm:text-base">
              <FaEnvelope className="text-primary shrink-0" />
              <span>Email Address</span>
            </span>
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="input input-bordered w-full pl-10 sm:pl-11 pr-3 text-sm sm:text-base focus:input-primary transition-all duration-300"
              required
              disabled={loading || success}
              autoComplete="email"
            />
            <FaEnvelope className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
          </div>
        </div>

        {/* Password Input */}
        <div className="form-control">
          <label className="label px-0">
            <span className="label-text font-medium flex items-center gap-2 text-sm sm:text-base">
              <FaLock className="text-primary shrink-0" />
              <span>Password</span>
            </span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="input input-bordered w-full pl-10 sm:pl-11 pr-10 sm:pr-11 text-sm sm:text-base focus:input-primary transition-all duration-300"
              required
              disabled={loading || success}
              autoComplete="current-password"
            />
            <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
              disabled={loading || success}
            >
              {showPassword ? (
                <FaEyeSlash className="text-sm" />
              ) : (
                <FaEye className="text-sm" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
          <label className="label cursor-pointer justify-start gap-2 px-0 py-0">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="checkbox checkbox-primary checkbox-sm shrink-0"
              disabled={loading || success}
            />
            <span className="label-text text-base-content/70 text-xs sm:text-sm">
              Remember me
            </span>
          </label>
          <a
            href="#"
            className="text-primary hover:underline font-medium text-xs sm:text-sm transition-all duration-300"
          >
            Forgot Password?
          </a>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="btn btn-primary w-full text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          disabled={loading || success}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Signing In...
            </>
          ) : success ? (
            <>
              <FaCheckCircle />
              Success!
            </>
          ) : (
            <>
              <FaSignInAlt />
              Sign In
            </>
          )}
        </button>

        {/* Register Link */}
        <div className="text-center pt-3 sm:pt-4">
          <p className="text-base-content/70 text-sm sm:text-base">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline transition-all duration-300"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
