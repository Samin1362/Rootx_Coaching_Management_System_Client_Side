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
import { useTranslation } from "react-i18next";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Login = () => {
  const navigate = useNavigate();
  const { signInUser } = useAuth();
  const { t } = useTranslation(['auth', 'common']);
  const axiosSecure = useAxiosSecure();

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
      setError(t('auth:pleaseEnterEmail'));
      return;
    }

    if (!formData.password) {
      setError(t('auth:pleaseEnterPassword'));
      return;
    }

    setLoading(true);

    try {
      // Step 1: Sign in user with Firebase and get MongoDB user data
      const result = await signInUser(formData.email, formData.password);
      const dbUser = result.dbUser;

      setSuccess(true);

      // Step 2: Redirect based on user role
      if (dbUser?.isSuperAdmin || dbUser?.role === "super_admin" || dbUser?.role === "super-admin") {
        // Super admin goes to super admin dashboard
        navigate("/super-admin/dashboard", { replace: true });
      } else {
        // Regular users go to normal dashboard
        navigate("/dashboard/overview", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);

      // Handle specific Firebase errors
      if (err.code === "auth/user-not-found") {
        setError(t('auth:userNotFound'));
      } else if (err.code === "auth/wrong-password") {
        setError(t('auth:wrongPassword'));
      } else if (err.code === "auth/invalid-email") {
        setError(t('auth:invalidEmail'));
      } else if (err.code === "auth/user-disabled") {
        setError(t('auth:userDisabled'));
      } else if (err.code === "auth/too-many-requests") {
        setError(t('auth:tooManyRequests'));
      } else if (err.code === "auth/network-request-failed") {
        setError(t('auth:networkError'));
      } else if (err.code === "auth/invalid-credential") {
        setError(t('auth:invalidCredential'));
      } else {
        setError(t('auth:loginFailed'));
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
          {t('auth:welcomeBack')}
        </h2>
        <p className="text-sm sm:text-base text-base-content/60 px-2 wrap-break-word">
          {t('auth:signInToContinue')}
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success mb-4">
          <FaCheckCircle className="text-lg shrink-0" />
          <span className="text-sm sm:text-base">
            {t('auth:loginSuccessful')}
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
              <span>{t('auth:emailAddress')}</span>
            </span>
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth:enterYourEmail')}
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
              <span>{t('auth:password')}</span>
            </span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth:enterYourPassword')}
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
              {t('auth:rememberMe')}
            </span>
          </label>
          <a
            href="#"
            className="text-primary hover:underline font-medium text-xs sm:text-sm transition-all duration-300"
          >
            {t('auth:forgotPassword')}
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
              {t('auth:signingIn')}
            </>
          ) : success ? (
            <>
              <FaCheckCircle />
              {t('auth:success')}
            </>
          ) : (
            <>
              <FaSignInAlt />
              {t('auth:signIn')}
            </>
          )}
        </button>

        {/* Signup Link */}
        <div className="text-center pt-3 sm:pt-4">
          <p className="text-base-content/70 text-sm sm:text-base">
            {t('auth:dontHaveAccount')}{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline transition-all duration-300"
            >
              {t('auth:createAccount')}
            </Link>
          </p>
          <p className="text-base-content/70 text-sm sm:text-base mt-2">
            Want to create an organization?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline transition-all duration-300"
            >
              Sign Up Here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
