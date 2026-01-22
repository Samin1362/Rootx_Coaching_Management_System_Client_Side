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
} from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser, updateUser } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  // Cloudinary configuration
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
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

  // Handle image upload with Cloudinary
  const handleImageUpload = () => {
    setUploadingImage(true);

    // Create Cloudinary widget
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ["local", "camera"],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
        croppingShowDimensions: true,
        folder: "rootx_profiles",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxImageFileSize: 2000000, // 2MB
        maxImageWidth: 500,
        maxImageHeight: 500,
      },
      (error, result) => {
        setUploadingImage(false);
        if (error) {
          console.error("Upload error:", error);
          setError("Failed to upload image. Please try again.");
          return;
        }

        if (result.event === "success") {
          setProfileImage(result.info.secure_url);
          setError(""); // Clear any previous errors
        }
      }
    );

    widget.open();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    setLoading(true);

    try {
      // 1. Register user with Firebase
      const userCredential = await registerUser(formData.email, formData.password);

      // 2. Update user profile with name and photo
      await updateUser(formData.name, profileImage || null);

      // 3. Create user in backend database
      try {
        await axiosSecure.post("/users/register", {
          name: formData.name,
          email: formData.email,
          firebaseUid: userCredential.user.uid,
          photoURL: profileImage || null,
          role: "staff", // Default role for self-registered users
        });
      } catch (backendError) {
        console.error("Backend registration error:", backendError);
        // Continue even if backend registration fails - user can be added later
      }

      // 4. Show success message
      setSuccess(true);

      // 5. Redirect to waiting page after 2 seconds
      setTimeout(() => {
        navigate("/waiting-for-organization");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);

      // Handle specific Firebase errors
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address format");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Failed to create account. Please try again.");
      } setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
          <FaUserCircle className="text-2xl sm:text-3xl text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-base-content mb-2 wrap-break-word">
          Create Account
        </h2>
        <p className="text-sm sm:text-base text-base-content/60 px-2 wrap-break-word">
          Join RootX to manage your coaching institute
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success mb-4">
          <FaCheckCircle className="text-lg" />
          <span className="text-sm sm:text-base">
            Account created successfully! Redirecting to login...
          </span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-4">
          <FaExclamationCircle className="text-lg" />
          <span className="text-sm sm:text-base">{error}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Profile Image Upload */}
        <div className="form-control">
          <label className="label px-0">
            <span className="label-text font-medium flex items-center gap-2 text-sm sm:text-base">
              <FaImage className="text-primary shrink-0" />
              <span>Profile Picture (Optional)</span>
            </span>
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Profile Preview */}
            <div className="avatar">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-2 ring-primary/30 hover:ring-primary/50 transition-all duration-300">
                {profileImage ? (
                  <img src={profileImage} alt="Profile preview" />
                ) : (
                  <div className="w-full h-full bg-base-200 flex items-center justify-center">
                    <FaUserCircle className="text-4xl sm:text-5xl text-base-content/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={loading || success || uploadingImage}
              className="btn btn-outline btn-primary btn-sm sm:btn-md gap-2 hover:scale-105 transition-all duration-300"
            >
              {uploadingImage ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <FaCamera />
                  {profileImage ? "Change Photo" : "Upload Photo"}
                </>
              )}
            </button>
          </div>
          <label className="label px-0">
            <span className="label-text-alt text-base-content/60 text-xs">
              Recommended: Square image, max 2MB
            </span>
          </label>
        </div>

        {/* Full Name Input */}
        <div className="form-control">
          <label className="label px-0">
            <span className="label-text font-medium flex items-center gap-2 text-sm sm:text-base">
              <FaUser className="text-primary shrink-0" />
              <span>Full Name</span>
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="input input-bordered w-full pl-10 sm:pl-11 pr-3 text-sm sm:text-base focus:input-primary transition-all duration-300"
              required
              disabled={loading || success}
            />
            <FaUser className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
          </div>
        </div>

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
              placeholder="Create password"
              className="input input-bordered w-full pl-10 sm:pl-11 pr-10 sm:pr-11 text-sm sm:text-base focus:input-primary transition-all duration-300"
              required
              disabled={loading || success}
              minLength={8}
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
          <label className="label px-0">
            <span className="label-text-alt text-base-content/60 text-xs">
              Must be at least 8 characters
            </span>
          </label>
        </div>

        {/* Confirm Password Input */}
        <div className="form-control">
          <label className="label px-0">
            <span className="label-text font-medium flex items-center gap-2 text-sm sm:text-base">
              <FaLock className="text-primary shrink-0" />
              <span>Confirm Password</span>
            </span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className="input input-bordered w-full pl-10 sm:pl-11 pr-10 sm:pr-11 text-sm sm:text-base focus:input-primary transition-all duration-300"
              required
              disabled={loading || success}
            />
            <FaLock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
              disabled={loading || success}
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="text-sm" />
              ) : (
                <FaEye className="text-sm" />
              )}
            </button>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-2 sm:gap-3 px-0">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="checkbox checkbox-primary checkbox-sm shrink-0"
              required
              disabled={loading || success}
            />
            <span className="label-text text-base-content/70 text-xs sm:text-sm leading-relaxed wrap-break-word">
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          className="btn btn-primary w-full text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          disabled={loading || success}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Creating Account...
            </>
          ) : success ? (
            <>
              <FaCheckCircle />
              Account Created!
            </>
          ) : (
            "Create Account"
          )}
        </button>

        {/* Login Link */}
        <div className="text-center pt-3 sm:pt-4">
          <p className="text-base-content/70 text-sm sm:text-base">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline transition-all duration-300"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>

      {/* Additional Info */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex gap-2 sm:gap-3">
          <div className="text-primary text-lg sm:text-xl mt-0.5 shrink-0">
            <MdAdminPanelSettings />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-base-content mb-1 text-sm sm:text-base">
              Organization Invitation Required
            </h4>
            <p className="text-xs sm:text-sm text-base-content/60 leading-relaxed">
              After creating your account, you'll need to be invited to an organization by an admin to access the dashboard features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
