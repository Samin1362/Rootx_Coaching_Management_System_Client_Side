import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaBan,
  FaExclamationCircle,
  FaPaperPlane,
  FaClock,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useOrganization } from "../contexts/organization";
import { useNotification } from "../contexts/NotificationContext";

const OrganizationSuspended = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { organization, refreshOrganization } = useOrganization();
  const notification = useNotification();
  const queryClient = useQueryClient();

  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Fetch pending reactivation request
  const { data: pendingRequestData, isLoading: loadingRequest } = useQuery({
    queryKey: ["reactivation-request-pending"],
    queryFn: async () => {
      const response = await axiosSecure.get(
        "/organizations/reactivation-request/pending"
      );
      return response.data.data;
    },
    retry: false,
  });

  // Submit reactivation request mutation
  const submitRequestMutation = useMutation({
    mutationFn: async (message) => {
      const response = await axiosSecure.post(
        "/organizations/reactivation-request",
        { requestMessage: message }
      );
      return response.data;
    },
    onSuccess: () => {
      notification.success(
        "Reactivation request submitted successfully! An administrator will review it shortly."
      );
      queryClient.invalidateQueries(["reactivation-request-pending"]);
      setRequestMessage("");
      setShowRequestForm(false);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit reactivation request";
      notification.error(errorMessage);
    },
  });

  // Cancel reactivation request mutation
  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      const response = await axiosSecure.delete(
        `/organizations/reactivation-request/${requestId}`
      );
      return response.data;
    },
    onSuccess: () => {
      notification.success("Reactivation request cancelled");
      queryClient.invalidateQueries(["reactivation-request-pending"]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to cancel request";
      notification.error(errorMessage);
    },
  });

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!requestMessage.trim()) {
      notification.error("Please provide a message explaining your request");
      return;
    }
    submitRequestMutation.mutate(requestMessage);
  };

  const handleCancelRequest = () => {
    if (pendingRequestData?._id) {
      if (
        window.confirm("Are you sure you want to cancel your reactivation request?")
      ) {
        cancelRequestMutation.mutate(pendingRequestData._id);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if organization is actually suspended
  if (organization && organization.status !== "suspended") {
    // Organization is not suspended, redirect to dashboard
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card max-w-3xl w-full bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* Suspension Notice */}
          <div className="text-center mb-6">
            <FaBan className="text-6xl text-error mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-error">
              Organization Suspended
            </h1>
            <p className="text-base-content/60 mt-2">
              Your organization account has been temporarily suspended.
            </p>
          </div>

          {/* Suspension Details */}
          <div className="alert alert-error mb-6">
            <FaExclamationCircle className="text-2xl" />
            <div className="flex-1">
              <h3 className="font-bold text-lg">Suspension Reason:</h3>
              <p className="mt-1">
                {organization?.suspensionReason || "No reason provided"}
              </p>
              <p className="text-sm mt-2 opacity-80">
                Suspended on: {formatDate(organization?.suspendedAt)}
              </p>
              <p className="text-sm mt-1 opacity-80">
                Organization: {organization?.name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Pending Request or Request Form */}
          {loadingRequest ? (
            <div className="text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="mt-4 text-base-content/60">
                Loading request status...
              </p>
            </div>
          ) : pendingRequestData ? (
            /* Pending Request Card */
            <div className="bg-base-200 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                {pendingRequestData.status === "pending" && (
                  <FaClock className="text-3xl text-warning flex-shrink-0 mt-1" />
                )}
                {pendingRequestData.status === "approved" && (
                  <FaCheckCircle className="text-3xl text-success flex-shrink-0 mt-1" />
                )}
                {pendingRequestData.status === "rejected" && (
                  <FaTimesCircle className="text-3xl text-error flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {pendingRequestData.status === "pending" &&
                      "Reactivation Request Pending"}
                    {pendingRequestData.status === "approved" &&
                      "Reactivation Request Approved"}
                    {pendingRequestData.status === "rejected" &&
                      "Reactivation Request Rejected"}
                  </h3>

                  {pendingRequestData.status === "pending" && (
                    <p className="text-base-content/70 mb-4">
                      Your reactivation request has been submitted and is awaiting
                      review by an administrator.
                    </p>
                  )}

                  {pendingRequestData.status === "approved" && (
                    <div className="alert alert-success mb-4">
                      <FaCheckCircle />
                      <div>
                        <p className="font-semibold">
                          Your reactivation request has been approved!
                        </p>
                        <p className="text-sm">
                          Please refresh the page or log out and log back in.
                        </p>
                      </div>
                    </div>
                  )}

                  {pendingRequestData.status === "rejected" && (
                    <div className="alert alert-error mb-4">
                      <FaTimesCircle />
                      <div>
                        <p className="font-semibold">
                          Your reactivation request has been rejected.
                        </p>
                        {pendingRequestData.rejectionReason && (
                          <p className="text-sm mt-1">
                            Reason: {pendingRequestData.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-base-100 rounded p-4 mb-4">
                    <p className="text-sm text-base-content/60 mb-2">
                      Your Message:
                    </p>
                    <p className="text-base-content">
                      {pendingRequestData.requestMessage}
                    </p>
                  </div>

                  <div className="text-sm text-base-content/60 space-y-1">
                    <p>
                      Submitted by: {pendingRequestData.requestedByName} (
                      {pendingRequestData.requestedByEmail})
                    </p>
                    <p>
                      Submitted on: {formatDate(pendingRequestData.createdAt)}
                    </p>
                    {pendingRequestData.reviewedByName && (
                      <>
                        <p>
                          Reviewed by: {pendingRequestData.reviewedByName}
                        </p>
                        <p>
                          Reviewed on: {formatDate(pendingRequestData.reviewedAt)}
                        </p>
                        {pendingRequestData.reviewNotes && (
                          <p>Notes: {pendingRequestData.reviewNotes}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {pendingRequestData.status === "pending" && (
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelRequest}
                    className="btn btn-outline btn-error"
                    disabled={cancelRequestMutation.isPending}
                  >
                    {cancelRequestMutation.isPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <FaTimes />
                        Cancel Request
                      </>
                    )}
                  </button>
                </div>
              )}

              {pendingRequestData.status === "rejected" && (
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      cancelRequestMutation.mutate(pendingRequestData._id);
                      setTimeout(() => setShowRequestForm(true), 500);
                    }}
                    className="btn btn-primary"
                  >
                    <FaPaperPlane />
                    Submit New Request
                  </button>
                </div>
              )}

              {pendingRequestData.status === "approved" && (
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      refreshOrganization();
                      window.location.reload();
                    }}
                    className="btn btn-success"
                  >
                    <FaCheckCircle />
                    Refresh and Continue
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Request Form */
            <div className="bg-base-200 rounded-lg p-6">
              {!showRequestForm ? (
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4">
                    Request Reactivation
                  </h3>
                  <p className="text-base-content/70 mb-6">
                    You can submit a request to reactivate your organization
                    account. An administrator will review your request and
                    respond accordingly.
                  </p>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="btn btn-primary"
                  >
                    <FaPaperPlane />
                    Submit Reactivation Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest}>
                  <h3 className="text-xl font-bold mb-4">
                    Submit Reactivation Request
                  </h3>
                  <p className="text-base-content/70 mb-4">
                    Please explain why you would like your organization account
                    to be reactivated. Provide any relevant information that
                    will help the administrator make a decision.
                  </p>

                  <div className="form-control mb-6">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Your Message *
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-32"
                      placeholder="Please explain why your organization should be reactivated..."
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      required
                      disabled={submitRequestMutation.isPending}
                    ></textarea>
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Be clear and concise in your explanation
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequestForm(false);
                        setRequestMessage("");
                      }}
                      className="btn btn-ghost"
                      disabled={submitRequestMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitRequestMutation.isPending}
                    >
                      {submitRequestMutation.isPending ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane />
                          Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Support Information */}
          <div className="mt-6 p-4 bg-base-200 rounded-lg">
            <p className="text-sm text-base-content/70">
              <strong>Need help?</strong> If you believe this suspension is a
              mistake or if you have questions, please contact support at{" "}
              <a
                href="mailto:support@example.com"
                className="link link-primary"
              >
                support@example.com
              </a>
            </p>
          </div>

          {/* Logout Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login", { replace: true });
              }}
              className="btn btn-outline"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSuspended;
