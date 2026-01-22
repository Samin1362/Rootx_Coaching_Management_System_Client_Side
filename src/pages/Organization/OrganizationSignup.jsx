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
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const OrganizationSignup = () => {
  const navigate = useNavigate();
  const { registerUser, signInUser, updateUser } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cloudinary configuration
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Form state
  const [formData, setFormData] = useState({
    // Organization details
    organizationName: "",
    slug: "",
    email: "",
    phone: "",

    // Owner details
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    confirmPassword: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from organization name
    if (name === "organizationName") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }

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

  // Validate step 1
  const validateStep1 = () => {
    if (!formData.organizationName.trim()) {
      setError("Organization name is required");
      return false;
    }
    if (!formData.slug.trim()) {
      setError("Organization slug is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Organization email is required");
      return false;
    }
    return true;
  };

  // Validate step 2
  const validateStep2 = () => {
    if (!formData.ownerName.trim()) {
      setError("Owner name is required");
      return false;
    }
    if (!formData.ownerEmail.trim()) {
      setError("Owner email is required");
      return false;
    }
    if (!formData.ownerPassword) {
      setError("Password is required");
      return false;
    }
    if (formData.ownerPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.ownerPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  // Handle next step
  const handleNext = () => {
    setError("");
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setError("");
    setCurrentStep(1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      let userCredential;
      let isExistingUser = false;

      // Step 1: Try to register user with Firebase
      try {
        userCredential = await registerUser(
          formData.ownerEmail,
          formData.ownerPassword
        );
      } catch (firebaseErr) {
        // If email already exists, sign in the user instead
        if (firebaseErr.code === "auth/email-already-in-use") {
          isExistingUser = true;

          // Try to sign in with provided credentials
          try {
            userCredential = await signInUser(
              formData.ownerEmail,
              formData.ownerPassword
            );
          } catch (signInErr) {
            if (signInErr.code === "auth/wrong-password") {
              setError("This email is already registered with a different password. Please use the correct password or sign in first.");
              setLoading(false);
              return;
            }
            throw signInErr;
          }

          // Check if user already has an organization
          try {
            const userCheckResponse = await axiosSecure.get("/users/me");
            const userData = userCheckResponse.data.data;

            if (userData.organizationId) {
              setError("You already belong to an organization. Each user can only be part of one organization.");
              setLoading(false);
              return;
            }
          } catch (checkErr) {
            // If user doesn't exist in MongoDB, that's fine - we'll create them
            console.log("User not in MongoDB yet, will create with organization");
          }
        } else {
          // Other Firebase errors
          throw firebaseErr;
        }
      }

      // Step 2: Update Firebase profile with name and photo
      await updateUser(formData.ownerName, profileImage || null);

      // Step 3: Create organization in backend (which also creates the user)
      const response = await axiosSecure.post("/organizations", {
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

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);

      // Handle specific Firebase errors
      if (err.code === "auth/invalid-email") {
        setError("Invalid email address format");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to create organization. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <FaRocket className="text-4xl text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-base-content mb-2">
            Start Your Journey
          </h1>
          <p className="text-base-content/60">
            Create your organization and get started in minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= 1
                    ? "bg-primary text-white"
                    : "bg-base-300 text-base-content/40"
                }`}
              >
                1
              </div>
              <span
                className={`hidden sm:inline ${
                  currentStep >= 1 ? "text-primary font-semibold" : "text-base-content/60"
                }`}
              >
                Organization
              </span>
            </div>

            {/* Divider */}
            <div className="w-12 h-1 bg-base-300">
              <div
                className={`h-full bg-primary transition-all duration-300 ${
                  currentStep >= 2 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= 2
                    ? "bg-primary text-white"
                    : "bg-base-300 text-base-content/40"
                }`}
              >
                2
              </div>
              <span
                className={`hidden sm:inline ${
                  currentStep >= 2 ? "text-primary font-semibold" : "text-base-content/60"
                }`}
              >
                Owner Details
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body p-6 sm:p-8">
            {/* Success Alert */}
            {success && (
              <div className="alert alert-success mb-6">
                <FaCheckCircle className="text-lg" />
                <span>
                  Organization created successfully! Redirecting to login...
                </span>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error mb-6">
                <FaExclamationCircle className="text-lg" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Organization Details */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-base-content mb-6">
                    Organization Details
                  </h2>

                  {/* Organization Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaBuilding className="text-primary" />
                        Organization Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder="e.g., ABC Coaching Center"
                      className="input input-bordered w-full focus:input-primary"
                      required
                      disabled={loading || success}
                    />
                  </div>

                  {/* Slug */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaGlobe className="text-primary" />
                        Organization Slug
                      </span>
                    </label>
                    <div className="join w-full">
                      <span className="join-item btn btn-disabled bg-base-200">
                        rootx.app/
                      </span>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="abc-coaching"
                        className="input input-bordered join-item flex-1 focus:input-primary"
                        required
                        disabled={loading || success}
                        pattern="[a-z0-9\-]+"
                      />
                    </div>
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        This will be your organization's unique identifier
                      </span>
                    </label>
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaEnvelope className="text-primary" />
                        Organization Email
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@abccoaching.com"
                      className="input input-bordered w-full focus:input-primary"
                      required
                      disabled={loading || success}
                    />
                  </div>

                  {/* Phone */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaPhone className="text-primary" />
                        Phone Number (Optional)
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+880 1712-345678"
                      className="input input-bordered w-full focus:input-primary"
                      disabled={loading || success}
                    />
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary w-full text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    disabled={loading || success}
                  >
                    Next Step
                  </button>
                </div>
              )}

              {/* Step 2: Owner Details */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-base-content mb-6">
                    Owner Account Details
                  </h2>

                  {/* Profile Image Upload */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaUserCircle className="text-primary" />
                        Profile Photo (Optional)
                      </span>
                    </label>
                    <div className="flex items-center gap-4">
                      {profileImage ? (
                        <div className="avatar">
                          <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={profileImage} alt="Profile" />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="w-20 h-20 rounded-full bg-base-300 text-base-content">
                            <FaUserCircle className="text-4xl" />
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        className="btn btn-outline btn-primary"
                        disabled={loading || success || uploadingImage}
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
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Recommended: Square image, max 2MB
                      </span>
                    </label>
                  </div>

                  {/* Owner Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaUser className="text-primary" />
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="input input-bordered w-full focus:input-primary"
                      required
                      disabled={loading || success}
                    />
                  </div>

                  {/* Owner Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaEnvelope className="text-primary" />
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleChange}
                      placeholder="john@abccoaching.com"
                      className="input input-bordered w-full focus:input-primary"
                      required
                      disabled={loading || success}
                    />
                  </div>

                  {/* Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaLock className="text-primary" />
                        Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="ownerPassword"
                        value={formData.ownerPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="input input-bordered w-full focus:input-primary pr-12"
                        required
                        disabled={loading || success}
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                        disabled={loading || success}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Must be at least 8 characters
                      </span>
                    </label>
                  </div>

                  {/* Confirm Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium flex items-center gap-2">
                        <FaLock className="text-primary" />
                        Confirm Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="input input-bordered w-full focus:input-primary pr-12"
                        required
                        disabled={loading || success}
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                        disabled={loading || success}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="btn btn-outline flex-1"
                      disabled={loading || success}
                    >
                      Previous
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                      disabled={loading || success}
                    >
                      {loading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Creating...
                        </>
                      ) : success ? (
                        <>
                          <FaCheckCircle />
                          Success!
                        </>
                      ) : (
                        <>
                          <FaRocket />
                          Create Organization
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Login Link */}
            <div className="text-center mt-6 pt-6 border-t border-base-300">
              <p className="text-base-content/70">
                Already have an organization?{" "}
                <a
                  href="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign In
                </a>
              </p>
              <p className="text-base-content/70 mt-2">
                Want to see our plans?{" "}
                <Link
                  to="/plans"
                  className="text-primary font-semibold hover:underline"
                >
                  View Pricing
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-semibold text-base-content mb-1">
              Quick Setup
            </h3>
            <p className="text-sm text-base-content/60">
              Get started in under 5 minutes
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-base-content mb-1">
              Secure & Private
            </h3>
            <p className="text-sm text-base-content/60">
              Your data is encrypted and isolated
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-base-content mb-1">
              14-Day Free Trial
            </h3>
            <p className="text-sm text-base-content/60">
              No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSignup;
