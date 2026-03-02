import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaCamera,
  FaImage,
  FaArrowRight,
} from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
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
const Register = () => {
  const navigate = useNavigate();
  const { registerUser, updateUser } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState("");
  const [success, setSuccess]                     = useState(false);
  const [uploadingImage, setUploadingImage]       = useState(false);
  const [profileImage, setProfileImage]           = useState("");

  const cloudName     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  };

  const handleImageUpload = () => {
    setUploadingImage(true);
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "camera"],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
        croppingShowDimensions: true,
        folder: "rootx_profiles",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxImageFileSize: 2000000,
        maxImageWidth: 500,
        maxImageHeight: 500,
      },
      (error, result) => {
        setUploadingImage(false);
        if (error) { setError("Failed to upload image. Please try again."); return; }
        if (result.event === "success") { setProfileImage(result.info.secure_url); setError(""); }
      }
    );
    widget.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim())                             { setError("Please enter your full name"); return; }
    if (!formData.email.trim())                            { setError("Please enter your email address"); return; }
    if (formData.password.length < 8)                      { setError("Password must be at least 8 characters long"); return; }
    if (formData.password !== formData.confirmPassword)    { setError("Passwords do not match"); return; }
    if (!formData.agreeTerms)                              { setError("Please agree to the Terms & Conditions"); return; }

    setLoading(true);

    try {
      const userCredential = await registerUser(formData.email, formData.password);
      await updateUser(formData.name, profileImage || null);

      try {
        await axiosSecure.post("/users/register", {
          name: formData.name,
          email: formData.email,
          firebaseUid: userCredential.user.uid,
          photoURL: profileImage || null,
          role: "staff",
        });
      } catch (_) { /* Continue even if backend registration fails */ }

      setSuccess(true);
      setTimeout(() => { navigate("/waiting-for-organization"); }, 2000);
    } catch (err) {
      if      (err.code === "auth/email-already-in-use")  setError("This email is already registered. Please sign in instead.");
      else if (err.code === "auth/invalid-email")         setError("Invalid email address format");
      else if (err.code === "auth/weak-password")         setError("Password is too weak. Please use a stronger password.");
      else if (err.code === "auth/network-request-failed") setError("Network error. Please check your internet connection.");
      else                                                setError("Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="w-full">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="text-center mb-6">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3"
          style={{
            background: "linear-gradient(135deg, rgba(245,146,61,0.18) 0%, rgba(255,107,107,0.12) 100%)",
            border: "1px solid rgba(245,146,61,0.25)",
          }}
        >
          <FaUserCircle className="text-2xl" style={{ color: "#f5923d" }} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: "#fff" }}>
          Create Account
        </h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.48)" }}>
          Join RootX to manage your coaching institute
        </p>
      </div>

      {/* ── Success alert ────────────────────────────────────── */}
      {success && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}
        >
          <FaCheckCircle className="shrink-0" />
          <span>Account created successfully! Redirecting...</span>
        </div>
      )}

      {/* ── Error alert ──────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
        >
          <FaExclamationCircle className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Profile image upload */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
            <FaImage style={{ color: "#f5923d" }} />
            Profile Picture <span style={{ color: "rgba(255,255,255,0.35)" }}>(Optional)</span>
          </label>
          <div className="flex items-center gap-4">
            {/* Avatar preview */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
              style={{
                background: profileImage ? "transparent" : "rgba(255,255,255,0.05)",
                border: "2px solid rgba(245,146,61,0.3)",
              }}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle className="text-3xl" style={{ color: "rgba(255,255,255,0.25)" }} />
              )}
            </div>

            {/* Upload button */}
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={loading || success || uploadingImage}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                cursor: loading || success || uploadingImage ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading && !success && !uploadingImage) {
                  e.currentTarget.style.borderColor = "rgba(245,146,61,0.4)";
                  e.currentTarget.style.color = "#f5923d";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}
            >
              {uploadingImage ? (
                <><span className="loading loading-spinner loading-xs" />Uploading...</>
              ) : (
                <><FaCamera className="text-xs" />{profileImage ? "Change Photo" : "Upload Photo"}</>
              )}
            </button>

            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Max 2MB
            </span>
          </div>
        </div>

        {/* Full name */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            <FaUser style={{ color: "#f5923d" }} />Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="dark-input"
              style={{ ...inputBase, paddingLeft: "2.5rem" }}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              disabled={loading || success}
            />
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            <FaEnvelope style={{ color: "#f5923d" }} />Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="dark-input"
              style={{ ...inputBase, paddingLeft: "2.5rem" }}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              disabled={loading || success}
            />
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            <FaLock style={{ color: "#f5923d" }} />Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password (min 8 chars)"
              className="dark-input"
              style={{ ...inputBase, paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              disabled={loading || success}
              minLength={8}
            />
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }} />
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

        {/* Confirm password */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            <FaLock style={{ color: "#f5923d" }} />Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="dark-input"
              style={{ ...inputBase, paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              disabled={loading || success}
            />
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }} />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer" }}
              disabled={loading || success}
            >
              {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className="mt-0.5 w-4 h-4 rounded shrink-0"
            style={{ accentColor: "#f5923d" }}
            required
            disabled={loading || success}
          />
          <span className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            I agree to the{" "}
            <a href="#" className="font-medium" style={{ color: "#f5923d" }}>Terms & Conditions</a>
            {" "}and{" "}
            <a href="#" className="font-medium" style={{ color: "#f5923d" }}>Privacy Policy</a>
          </span>
        </label>

        {/* Submit */}
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
            <><span className="loading loading-spinner loading-sm" />Creating Account...</>
          ) : success ? (
            <><FaCheckCircle />Account Created!</>
          ) : (
            <>Create Account <FaArrowRight className="text-[10px]" /></>
          )}
        </button>

        {/* Login link */}
        <div className="text-center pt-1">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold transition-colors duration-200"
              style={{ color: "#f5923d" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#f5923d")}
            >
              Sign In
            </Link>
          </p>
        </div>

      </form>

      {/* ── Info box ─────────────────────────────────────────── */}
      <div
        className="flex gap-3 mt-5 p-3.5 rounded-xl"
        style={{
          background: "rgba(245,146,61,0.07)",
          border: "1px solid rgba(245,146,61,0.18)",
        }}
      >
        <MdAdminPanelSettings className="text-xl mt-0.5 shrink-0" style={{ color: "#f5923d" }} />
        <div>
          <h4 className="font-semibold text-xs mb-1" style={{ color: "#fff" }}>
            Organization Invitation Required
          </h4>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            After creating your account, you'll need to be invited to an organization by an admin to access dashboard features.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Register;
