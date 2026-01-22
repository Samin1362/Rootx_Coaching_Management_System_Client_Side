import React from "react";
import { Link } from "react-router";
import {
  FaBuilding,
  FaEnvelope,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router";

const WaitingForOrganization = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl bg-base-100 shadow-2xl">
        <div className="card-body p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center">
              <MdPendingActions className="text-5xl text-warning" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-base-content mb-3">
            Waiting for Organization Access
          </h1>

          {/* User Info */}
          <div className="bg-base-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="w-12 h-12 rounded-full bg-primary text-white">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" />
                  ) : (
                    <FaUserCircle className="text-3xl" />
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold text-base-content">
                  {user?.displayName || "User"}
                </p>
                <p className="text-sm text-base-content/60 flex items-center gap-2">
                  <FaEnvelope className="text-xs" />
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4 mb-6">
            <p className="text-base-content/80 text-center">
              Your account has been created successfully! However, you're not
              currently associated with any organization.
            </p>

            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div className="text-sm">
                <p className="font-semibold mb-1">What's next?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ask an organization admin to invite you via email</li>
                  <li>They can add you from their User Management page</li>
                  <li>You'll receive access once added to an organization</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-error flex-1 gap-2"
            >
              <FaSignOutAlt />
              Logout
            </button>
            <Link to="/signup" className="btn btn-primary flex-1 gap-2">
              <FaBuilding />
              Create Your Own Organization
            </Link>
          </div>

          {/* Support Info */}
          <div className="divider">OR</div>
          <p className="text-center text-sm text-base-content/60">
            Need help?{" "}
            <a
              href="mailto:support@rootxsoftware.com"
              className="text-primary hover:underline font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingForOrganization;
