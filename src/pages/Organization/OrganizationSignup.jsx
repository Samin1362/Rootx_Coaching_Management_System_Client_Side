import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaLock,
  FaCheckCircle,
  FaExclamationCircle,
  FaRocket,
  FaGlobe,
  FaEye,
  FaEyeSlash,
  FaCamera,
  FaUserCircle,
  FaArrowRight,
  FaArrowLeft,
  FaShieldAlt,
  FaChartBar,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Logo from "../../components/Logo";

/* ── Shared input tokens ─────────────────────────────────── */
const inputBase = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.5rem",
  color: "#fff",
  width: "100%",
  fontSize: "0.875rem",
  padding: "0.65rem 0.875rem",
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

const BOTTOM_FEATURES = [
  { Icon: FaRocket,     title: "Quick Setup",      desc: "Get started in under 5 minutes", color: "#f5923d" },
  { Icon: FaShieldAlt,  title: "Secure & Private", desc: "Your data is encrypted and isolated", color: "#ff6b6b" },
  { Icon: FaChartBar,   title: "14-Day Free Trial", desc: "No credit card required", color: "#f5923d" },
];

/* ─────────────────────────────────────────────────────────── */
const OrganizationSignup = () => {
  const navigate    = useNavigate();
  const { registerUser, signInUser, updateUser } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [loading, setLoading]                         = useState(false);
  const [error, setError]                             = useState("");
  const [success, setSuccess]                         = useState(false);
  const [currentStep, setCurrentStep]                 = useState(1);
  const [uploadingImage, setUploadingImage]           = useState(false);
  const [profileImage, setProfileImage]               = useState("");
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const [formData, setFormData] = useState({
    organizationName: "",
    slug: "",
    email: "",
    phone: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "organizationName") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
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

  const validateStep1 = () => {
    if (!formData.organizationName.trim()) { setError("Organization name is required"); return false; }
    if (!formData.slug.trim())             { setError("Organization slug is required"); return false; }
    if (!formData.email.trim())            { setError("Organization email is required"); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.ownerName.trim())                            { setError("Owner name is required"); return false; }
    if (!formData.ownerEmail.trim())                           { setError("Owner email is required"); return false; }
    if (!formData.ownerPassword)                               { setError("Password is required"); return false; }
    if (formData.ownerPassword.length < 8)                     { setError("Password must be at least 8 characters"); return false; }
    if (formData.ownerPassword !== formData.confirmPassword)   { setError("Passwords do not match"); return false; }
    return true;
  };

  const handleNext = () => { setError(""); if (currentStep === 1 && validateStep1()) setCurrentStep(2); };
  const handlePrevious = () => { setError(""); setCurrentStep(1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateStep2()) return;
    setLoading(true);

    try {
      let userCredential;
      let isExistingUser = false;

      try {
        userCredential = await registerUser(formData.ownerEmail, formData.ownerPassword);
      } catch (firebaseErr) {
        if (firebaseErr.code === "auth/email-already-in-use") {
          isExistingUser = true;
          try {
            userCredential = await signInUser(formData.ownerEmail, formData.ownerPassword);
          } catch (signInErr) {
            if (signInErr.code === "auth/wrong-password") {
              setError("This email is already registered with a different password. Please use the correct password or sign in first.");
              setLoading(false);
              return;
            }
            throw signInErr;
          }
          try {
            const userCheckResponse = await axiosSecure.get("/users/me");
            const userData = userCheckResponse.data.data;
            if (userData.organizationId) {
              setError("You already belong to an organization. Each user can only be part of one organization.");
              setLoading(false);
              return;
            }
          } catch (_) { /* fine — user may not exist in MongoDB yet */ }
        } else {
          throw firebaseErr;
        }
      }

      await updateUser(formData.ownerName, profileImage || null);

      await axiosSecure.post("/organizations", {
        name: formData.organizationName,
        slug: formData.slug,
        email: formData.email,
        phone: formData.phone,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPassword: formData.ownerPassword,
        ownerPhotoURL: profileImage || "",
        ownerFirebaseUid: userCredential.user.uid,
      });

      setSuccess(true);
      setTimeout(() => { navigate("/login"); }, 2000);
    } catch (err) {
      if      (err.code === "auth/invalid-email")         setError("Invalid email address format");
      else if (err.code === "auth/weak-password")         setError("Password is too weak. Please use a stronger password.");
      else if (err.code === "auth/network-request-failed") setError("Network error. Please check your internet connection.");
      else if (err.response?.data?.message)               setError(err.response.data.message);
      else                                                setError("Failed to create organization. Please try again.");
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-x-hidden"
      style={{ background: "#0a1220" }}
    >

      {/* ── Background orbs ──────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full animate-float"
          style={{ background: "radial-gradient(circle, rgba(245,146,61,0.12) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full animate-float-reverse"
          style={{ background: "radial-gradient(circle, rgba(255,107,107,0.09) 0%, transparent 70%)", filter: "blur(70px)" }}
        />
        <div className="absolute inset-0 hero-grid-pattern opacity-20" />
      </div>

      <div className="w-full max-w-2xl relative z-10">

        {/* ── Top logo + heading ──────────────────────────────── */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-5">
            <Logo dark />
          </Link>
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(245,146,61,0.2) 0%, rgba(255,107,107,0.15) 100%)",
              border: "1px solid rgba(245,146,61,0.3)",
            }}
          >
            <FaRocket className="text-2xl" style={{ color: "#f5923d" }} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: "#fff" }}>
            Start Your Journey
          </h1>
          <p className="text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
            Create your organization and get started in minutes
          </p>
        </div>

        {/* ── Step progress ───────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
              style={{
                background: currentStep >= 1
                  ? "linear-gradient(135deg, #f5923d 0%, #ff6b6b 100%)"
                  : "rgba(255,255,255,0.07)",
                color: currentStep >= 1 ? "#fff" : "rgba(255,255,255,0.35)",
                boxShadow: currentStep >= 1 ? "0 4px 12px rgba(245,146,61,0.4)" : "none",
              }}
            >
              {currentStep > 1 ? <FaCheckCircle className="text-xs" /> : "1"}
            </div>
            <span
              className="hidden sm:inline text-sm font-medium transition-colors duration-300"
              style={{ color: currentStep >= 1 ? "#f5923d" : "rgba(255,255,255,0.35)" }}
            >
              Organization
            </span>
          </div>

          {/* Connector */}
          <div
            className="w-16 h-0.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: currentStep >= 2 ? "100%" : "0%",
                background: "linear-gradient(to right, #f5923d, #ff6b6b)",
              }}
            />
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
              style={{
                background: currentStep >= 2
                  ? "linear-gradient(135deg, #f5923d 0%, #ff6b6b 100%)"
                  : "rgba(255,255,255,0.07)",
                color: currentStep >= 2 ? "#fff" : "rgba(255,255,255,0.35)",
                boxShadow: currentStep >= 2 ? "0 4px 12px rgba(245,146,61,0.4)" : "none",
              }}
            >
              2
            </div>
            <span
              className="hidden sm:inline text-sm font-medium transition-colors duration-300"
              style={{ color: currentStep >= 2 ? "#f5923d" : "rgba(255,255,255,0.35)" }}
            >
              Owner Details
            </span>
          </div>
        </div>

        {/* ── Form card ───────────────────────────────────────── */}
        <div
          className="rounded-2xl shadow-2xl"
          style={{
            background: "rgba(13, 26, 45, 0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="p-6 sm:p-8">

            {/* Alerts */}
            {success && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}
              >
                <FaCheckCircle className="shrink-0" />
                <span>Organization created successfully! Redirecting to login...</span>
              </div>
            )}
            {error && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
              >
                <FaExclamationCircle className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* ── Step 1: Organization Details ─────────────── */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold mb-5" style={{ color: "#fff" }}>
                    Organization Details
                  </h2>

                  {/* Org name */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <FaBuilding style={{ color: "#f5923d" }} />Organization Name
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder="e.g., ABC Coaching Center"
                      className="dark-input"
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      required
                      disabled={loading || success}
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <FaGlobe style={{ color: "#f5923d" }} />Organization Slug
                    </label>
                    <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                      <span
                        className="flex items-center px-3 text-xs shrink-0"
                        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", borderRight: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        rootx.app/
                      </span>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="abc-coaching"
                        className="dark-input"
                        style={{
                          ...inputBase,
                          border: "none",
                          borderRadius: "0",
                          flex: 1,
                        }}
                        onFocus={(e) => { e.currentTarget.parentElement.style.borderColor = "#f5923d"; e.currentTarget.parentElement.style.boxShadow = "0 0 0 2px rgba(245,146,61,0.15)"; }}
                        onBlur={(e) => { e.currentTarget.parentElement.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.parentElement.style.boxShadow = "none"; }}
                        required
                        disabled={loading || success}
                        pattern="[a-z0-9\-]+"
                      />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                      This will be your organization's unique identifier
                    </p>
                  </div>

                  {/* Org email */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <FaEnvelope style={{ color: "#f5923d" }} />Organization Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@abccoaching.com"
                      className="dark-input"
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      required
                      disabled={loading || success}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <FaPhone style={{ color: "#f5923d" }} />
                      Phone Number
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+880 1712-345678"
                      className="dark-input"
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      disabled={loading || success}
                    />
                  </div>

                  {/* Next button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-shine w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #f5923d 0%, #ff6b6b 100%)",
                      color: "#fff",
                      border: "none",
                      cursor: loading || success ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(245,146,61,0.35)",
                    }}
                    disabled={loading || success}
                    onMouseEnter={(e) => { if (!loading && !success) e.currentTarget.style.boxShadow = "0 6px 22px rgba(245,146,61,0.55)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(245,146,61,0.35)"; }}
                  >
                    Next Step <FaArrowRight className="text-[10px]" />
                  </button>
                </div>
              )}

              {/* ── Step 2: Owner Details ─────────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold mb-5" style={{ color: "#fff" }}>
                    Owner Account Details
                  </h2>

                  {/* Profile photo */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <FaUserCircle style={{ color: "#f5923d" }} />
                      Profile Photo <span style={{ color: "rgba(255,255,255,0.35)" }}>(Optional)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                        style={{
                          background: profileImage ? "transparent" : "rgba(255,255,255,0.05)",
                          border: "2px solid rgba(245,146,61,0.3)",
                        }}
                      >
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <FaUserCircle className="text-3xl" style={{ color: "rgba(255,255,255,0.25)" }} />
                        )}
                      </div>
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
                    </div>
                  </div>

                  {/* Owner name */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <FaUser style={{ color: "#f5923d" }} />Full Name
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="dark-input"
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      required
                      disabled={loading || success}
                    />
                  </div>

                  {/* Owner email */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <FaEnvelope style={{ color: "#f5923d" }} />Email Address
                    </label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleChange}
                      placeholder="john@abccoaching.com"
                      className="dark-input"
                      style={inputBase}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      required
                      disabled={loading || success}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <FaLock style={{ color: "#f5923d" }} />Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="ownerPassword"
                        value={formData.ownerPassword}
                        onChange={handleChange}
                        placeholder="Min 8 characters"
                        className="dark-input"
                        style={{ ...inputBase, paddingRight: "2.75rem" }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        required
                        disabled={loading || success}
                        minLength={8}
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
                        style={{ ...inputBase, paddingRight: "2.75rem" }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        required
                        disabled={loading || success}
                        minLength={8}
                      />
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

                  {/* Back + Submit */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.7)",
                        cursor: loading || success ? "not-allowed" : "pointer",
                      }}
                      disabled={loading || success}
                      onMouseEnter={(e) => {
                        if (!loading && !success) {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                          e.currentTarget.style.color = "#fff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                      }}
                    >
                      <FaArrowLeft className="text-[10px]" />Back
                    </button>

                    <button
                      type="submit"
                      className="btn-shine flex items-center justify-center gap-2 flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
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
                        if (!loading && !success) e.currentTarget.style.boxShadow = "0 6px 22px rgba(245,146,61,0.55)";
                      }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(245,146,61,0.35)"; }}
                    >
                      {loading ? (
                        <><span className="loading loading-spinner loading-sm" />Creating...</>
                      ) : success ? (
                        <><FaCheckCircle />Success!</>
                      ) : (
                        <><FaRocket />Create Organization</>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>

            {/* Footer links */}
            <div
              className="text-center mt-6 pt-5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>
                Already have an organization?{" "}
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
              <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.42)" }}>
                Want to see our plans?{" "}
                <Link
                  to="/plans"
                  className="font-semibold transition-colors duration-200"
                  style={{ color: "#f5923d" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#f5923d")}
                >
                  View Pricing
                </Link>
              </p>
            </div>

          </div>
        </div>

        {/* ── Bottom feature cards ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {BOTTOM_FEATURES.map(({ Icon, title, desc, color }) => (
            <div
              key={title}
              className="text-center p-4 rounded-xl transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3"
                style={{ background: `${color}1a` }}
              >
                <Icon className="text-lg" style={{ color }} />
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: "#fff" }}>{title}</h3>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
          © 2026 RootX Coaching Management System. All rights reserved.
        </div>

      </div>
    </div>
  );
};

export default OrganizationSignup;
