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
  FaArrowRight,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import useAxiosSecure from "../../hooks/useAxiosSecure";

/* ── Shared inline style tokens ──────────────────────────── */
const inputBase = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.5rem",
  color: "#fff",
  width: "100%",
  fontSize: "0.875rem",
  padding: "0.625rem 0.75rem",
  transition: "border-color 0.2s, box-shadow 0.2s",
  outline: "none",
};

const onFocus = (e) => {
  e.currentTarget.style.borderColor = "#f5923d";
  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(245,146,61,0.15)";
};
const onBlur = (e) => {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
  e.currentTarget.style.boxShadow = "none";
};

/* ─────────────────────────────────────────────────────────── */
const Login = () => {
  const navigate = useNavigate();
  const { signInUser } = useAuth();
  const { t } = useTranslation(["auth", "common"]);
  const axiosSecure = useAxiosSecure();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError(t("auth:pleaseEnterEmail"));
      return;
    }
    if (!formData.password) {
      setError(t("auth:pleaseEnterPassword"));
      return;
    }

    setLoading(true);

    try {
      await signInUser(formData.email, formData.password);
      setSuccess(true);
      navigate("/dashboard/overview", { replace: true });
    } catch (err) {
      if      (err.code === "auth/user-not-found")        setError(t("auth:userNotFound"));
      else if (err.code === "auth/wrong-password")        setError(t("auth:wrongPassword"));
      else if (err.code === "auth/invalid-email")         setError(t("auth:invalidEmail"));
      else if (err.code === "auth/user-disabled")         setError(t("auth:userDisabled"));
      else if (err.code === "auth/too-many-requests")     setError(t("auth:tooManyRequests"));
      else if (err.code === "auth/network-request-failed") setError(t("auth:networkError"));
      else if (err.code === "auth/invalid-credential")    setError(t("auth:invalidCredential"));
      else                                                setError(t("auth:loginFailed"));
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="w-full">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="text-center mb-7">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(245,146,61,0.18) 0%, rgba(255,107,107,0.12) 100%)",
            border: "1px solid rgba(245,146,61,0.25)",
          }}
        >
          <FaSignInAlt className="text-2xl" style={{ color: "#f5923d" }} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: "#fff" }}>
          {t("auth:welcomeBack")}
        </h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.48)" }}>
          {t("auth:signInToContinue")}
        </p>
      </div>

      {/* ── Success alert ────────────────────────────────────── */}
      {success && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm"
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#4ade80",
          }}
        >
          <FaCheckCircle className="shrink-0" />
          <span>{t("auth:loginSuccessful")}</span>
        </div>
      )}

      {/* ── Error alert ──────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm"
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
          }}
        >
          <FaExclamationCircle className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            <FaEnvelope style={{ color: "#f5923d" }} />
            {t("auth:emailAddress")}
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("auth:enterYourEmail")}
              className="dark-input"
              style={{ ...inputBase, paddingLeft: "2.5rem" }}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              disabled={loading || success}
              autoComplete="email"
            />
            <FaEnvelope
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "rgba(255,255,255,0.3)" }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            <FaLock style={{ color: "#f5923d" }} />
            {t("auth:password")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("auth:enterYourPassword")}
              className="dark-input"
              style={{ ...inputBase, paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              disabled={loading || success}
              autoComplete="current-password"
            />
            <FaLock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "rgba(255,255,255,0.3)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer" }}
              disabled={loading || success}
            >
              {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded"
              style={{ accentColor: "#f5923d" }}
              disabled={loading || success}
            />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {t("auth:rememberMe")}
            </span>
          </label>
          <a
            href="#"
            className="text-xs font-medium transition-colors duration-200"
            style={{ color: "#f5923d" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#f5923d")}
          >
            {t("auth:forgotPassword")}
          </a>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="btn-shine w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: loading || success
              ? "rgba(245,146,61,0.45)"
              : "linear-gradient(135deg, #f5923d 0%, #ff6b6b 100%)",
            color: "#fff",
            border: "none",
            cursor: loading || success ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(245,146,61,0.35)",
          }}
          disabled={loading || success}
          onMouseEnter={(e) => {
            if (!loading && !success)
              e.currentTarget.style.boxShadow = "0 6px 22px rgba(245,146,61,0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(245,146,61,0.35)";
          }}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              {t("auth:signingIn")}
            </>
          ) : success ? (
            <>
              <FaCheckCircle />
              {t("auth:success")}
            </>
          ) : (
            <>
              <FaSignInAlt />
              {t("auth:signIn")}
              <FaArrowRight className="text-[10px]" />
            </>
          )}
        </button>

        {/* Links */}
        <div className="text-center pt-2 space-y-1.5">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            {t("auth:dontHaveAccount")}{" "}
            <Link
              to="/register"
              className="font-semibold transition-colors duration-200"
              style={{ color: "#f5923d" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#f5923d")}
            >
              {t("auth:createAccount")}
            </Link>
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Want to create an organization?{" "}
            <Link
              to="/signup"
              className="font-semibold transition-colors duration-200"
              style={{ color: "#f5923d" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#f5923d")}
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
