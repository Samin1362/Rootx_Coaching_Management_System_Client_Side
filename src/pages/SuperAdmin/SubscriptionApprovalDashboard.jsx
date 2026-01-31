import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { Link } from "react-router";
import {
  FaClipboardCheck,
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaExclamationTriangle,
  FaBan,
  FaBuilding,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import { useNotification } from "../../contexts/NotificationContext";

const SubscriptionApprovalDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const notification = useNotification();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [requestTypeFilter, setRequestTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Fetch subscription requests
  const { data, isLoading, error } = useQuery({
    queryKey: ["subscription-requests", page, limit, searchTerm, statusFilter, requestTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
        status: statusFilter,
        ...(searchTerm && { search: searchTerm }),
        ...(requestTypeFilter && { requestType: requestTypeFilter }),
      });
      const response = await axiosSecure.get(`/super-admin/subscription-requests?${params}`);
      return response.data.data;
    },
  });

  // Fetch expiring alerts
  const { data: expiringData } = useQuery({
    queryKey: ["expiring-alerts"],
    queryFn: async () => {
      const response = await axiosSecure.get("/super-admin/subscriptions/expiring-alerts?days=7");
      return response.data.data;
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, notes }) => {
      return axiosSecure.put(`/super-admin/subscription-requests/${requestId}/approve`, { notes });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(["subscription-requests"]);
      queryClient.invalidateQueries(["pending-request-count"]);
      setShowApproveModal(false);
      setSelectedRequest(null);
      setApproveNotes("");
      notification.success(response.data.message || "Request approved successfully");
    },
    onError: (error) => {
      notification.error(error.response?.data?.message || "Failed to approve request");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }) => {
      return axiosSecure.put(`/super-admin/subscription-requests/${requestId}/reject`, { reason });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(["subscription-requests"]);
      queryClient.invalidateQueries(["pending-request-count"]);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");
      notification.success(response.data.message || "Request rejected");
    },
    onError: (error) => {
      notification.error(error.response?.data?.message || "Failed to reject request");
    },
  });

  // Suspend expired mutation
  const suspendMutation = useMutation({
    mutationFn: async ({ orgId, reason }) => {
      return axiosSecure.put(`/super-admin/organizations/${orgId}/suspend-expired`, { reason });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(["expiring-alerts"]);
      notification.success(response.data.message || "Organization suspended");
    },
    onError: (error) => {
      notification.error(error.response?.data?.message || "Failed to suspend organization");
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="badge badge-warning badge-sm flex items-center gap-1">
            <FaClock className="text-xs" /> Pending
          </span>
        );
      case "approved":
        return (
          <span className="badge badge-success badge-sm flex items-center gap-1">
            <FaCheck className="text-xs" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="badge badge-error badge-sm flex items-center gap-1">
            <FaTimes className="text-xs" /> Rejected
          </span>
        );
      default:
        return <span className="badge badge-ghost badge-sm">{status}</span>;
    }
  };

  const getRequestTypeBadge = (type) => {
    if (type === "upgrade") {
      return (
        <span className="badge badge-info badge-sm flex items-center gap-1">
          <FaArrowUp className="text-xs" /> Upgrade
        </span>
      );
    }
    return (
      <span className="badge badge-secondary badge-sm flex items-center gap-1">
        <FaArrowDown className="text-xs" /> Downgrade
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate({
        requestId: selectedRequest._id,
        notes: approveNotes,
      });
    }
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      notification.warning("Please provide a rejection reason");
      return;
    }
    if (selectedRequest) {
      rejectMutation.mutate({
        requestId: selectedRequest._id,
        reason: rejectReason,
      });
    }
  };

  const handleSuspendExpired = (orgId, orgName) => {
    if (window.confirm(`Are you sure you want to suspend ${orgName}?`)) {
      suspendMutation.mutate({
        orgId,
        reason: "Subscription expired without renewal",
      });
    }
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading subscription requests: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaClipboardCheck className="text-primary" />
            Subscription Approvals
          </h1>
          <p className="text-base-content/60 mt-1">Review and manage subscription change requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-title">Pending</div>
          <div className="stat-value text-warning text-2xl">{data?.stats?.pending || 0}</div>
          <div className="stat-desc">Awaiting review</div>
        </div>
        <div className="stat">
          <div className="stat-title">Approved</div>
          <div className="stat-value text-success text-2xl">{data?.stats?.approved || 0}</div>
          <div className="stat-desc">Total approved</div>
        </div>
        <div className="stat">
          <div className="stat-title">Rejected</div>
          <div className="stat-value text-error text-2xl">{data?.stats?.rejected || 0}</div>
          <div className="stat-desc">Total rejected</div>
        </div>
        <div className="stat">
          <div className="stat-title">Expiring Soon</div>
          <div className="stat-value text-info text-2xl">
            {(expiringData?.stats?.expiringSoonCount || 0) + (expiringData?.stats?.expiredCount || 0)}
          </div>
          <div className="stat-desc">Need attention</div>
        </div>
      </div>

      {/* Expiring/Expired Alerts */}
      {((expiringData?.expiringSoon?.length > 0) || (expiringData?.expired?.length > 0)) && (
        <div className="card bg-error/10 border border-error/30">
          <div className="card-body">
            <h2 className="card-title text-error flex items-center gap-2">
              <FaExclamationTriangle />
              Subscription Alerts
            </h2>

            {/* Expired Subscriptions */}
            {expiringData?.expired?.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-error mb-2">Expired (Action Required)</h3>
                <div className="space-y-2">
                  {expiringData.expired.slice(0, 5).map((sub) => (
                    <div
                      key={sub._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-base-100 rounded-lg gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <FaBuilding className="text-error" />
                        <div>
                          <p className="font-medium">{sub.organizationName}</p>
                          <p className="text-xs text-base-content/60">
                            {sub.tier} plan - Expired {sub.daysOverdue} days ago
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/super-admin/organizations/${sub.organizationId}`}
                          className="btn btn-ghost btn-xs"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleSuspendExpired(sub.organizationId, sub.organizationName)}
                          className="btn btn-error btn-xs"
                          disabled={suspendMutation.isPending}
                        >
                          {suspendMutation.isPending ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <>
                              <FaBan className="text-xs" /> Suspend
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expiring Soon */}
            {expiringData?.expiringSoon?.length > 0 && (
              <div>
                <h3 className="font-semibold text-warning mb-2">Expiring Soon</h3>
                <div className="space-y-2">
                  {expiringData.expiringSoon.slice(0, 5).map((sub) => (
                    <div
                      key={sub._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-base-100 rounded-lg gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <FaBuilding className="text-warning" />
                        <div>
                          <p className="font-medium">{sub.organizationName}</p>
                          <p className="text-xs text-base-content/60">
                            {sub.tier} plan - Expires in {sub.daysUntilExpiration} days
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/super-admin/subscriptions/${sub._id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        <FaEye className="text-xs" /> View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="form-control flex-1">
              <div className="input-group">
                <span className="bg-base-200">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search by organization or user..."
                  className="input input-bordered w-full"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="form-control">
              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Status</option>
              </select>
            </div>

            {/* Request Type Filter */}
            <div className="form-control">
              <select
                className="select select-bordered"
                value={requestTypeFilter}
                onChange={(e) => {
                  setRequestTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="upgrade">Upgrades</option>
                <option value="downgrade">Downgrades</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : data?.requests?.length === 0 ? (
            <div className="text-center p-8 text-base-content/60">
              <FaClipboardCheck className="text-4xl mx-auto mb-4 opacity-30" />
              <p>No subscription requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-base-200">
                    <th>Organization</th>
                    <th>Type</th>
                    <th>Plan Change</th>
                    <th>Requested By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.requests?.map((request) => (
                    <tr key={request._id} className="hover">
                      <td>
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-primary" />
                          <div>
                            <p className="font-medium">{request.organizationName}</p>
                          </div>
                        </div>
                      </td>
                      <td>{getRequestTypeBadge(request.requestType)}</td>
                      <td>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="capitalize">{request.currentTier || "Free"}</span>
                          <span className="text-base-content/40">→</span>
                          <span className="font-semibold capitalize">{request.requestedTier}</span>
                        </div>
                        <div className="text-xs text-base-content/60">
                          {formatCurrency(request.requestedAmount)}/{request.requestedBillingCycle}
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm">{request.requestedByName}</p>
                          <p className="text-xs text-base-content/60">{request.requestedByEmail}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <FaCalendarAlt className="text-xs text-base-content/60" />
                          {formatDate(request.createdAt)}
                        </div>
                      </td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        <div className="flex gap-1">
                          {request.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApprove(request)}
                                className="btn btn-success btn-xs"
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleReject(request)}
                                className="btn btn-error btn-xs"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="btn btn-ghost btn-xs"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                          )}
                          <Link
                            to={`/super-admin/organizations/${request.organizationId}`}
                            className="btn btn-ghost btn-xs"
                            title="View Organization"
                          >
                            <FaBuilding />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-center p-4 border-t border-base-300">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  «
                </button>
                <button className="join-item btn btn-sm">
                  Page {page} of {data.pagination.pages}
                </button>
                <button
                  className="join-item btn btn-sm"
                  disabled={page === data.pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaCheck className="text-success" />
              Approve Subscription Request
            </h3>
            <div className="py-4 space-y-4">
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-sm text-base-content/60">Organization</p>
                <p className="font-semibold">{selectedRequest.organizationName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="text-sm text-base-content/60">Current Plan</p>
                  <p className="font-semibold capitalize">{selectedRequest.currentTier || "Free"}</p>
                </div>
                <div className="bg-success/20 p-4 rounded-lg">
                  <p className="text-sm text-base-content/60">Requested Plan</p>
                  <p className="font-semibold capitalize">{selectedRequest.requestedTier}</p>
                </div>
              </div>
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-sm text-base-content/60">Amount</p>
                <p className="font-semibold">
                  {formatCurrency(selectedRequest.requestedAmount)}/{selectedRequest.requestedBillingCycle}
                </p>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Notes (optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Add any notes for this approval..."
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                  setApproveNotes("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={confirmApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <FaCheck /> Approve
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowApproveModal(false)}></div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaTimes className="text-error" />
              Reject Subscription Request
            </h3>
            <div className="py-4 space-y-4">
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-sm text-base-content/60">Organization</p>
                <p className="font-semibold">{selectedRequest.organizationName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="text-sm text-base-content/60">Current Plan</p>
                  <p className="font-semibold capitalize">{selectedRequest.currentTier || "Free"}</p>
                </div>
                <div className="bg-error/20 p-4 rounded-lg">
                  <p className="text-sm text-base-content/60">Requested Plan</p>
                  <p className="font-semibold capitalize">{selectedRequest.requestedTier}</p>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Rejection Reason *</span>
                </label>
                <textarea
                  className="textarea textarea-bordered textarea-error"
                  placeholder="Please provide a reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-error">
                    This will be visible to the organization
                  </span>
                </label>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={confirmReject}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
              >
                {rejectMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <FaTimes /> Reject
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowRejectModal(false)}></div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaEye className="text-primary" />
              Request Details
            </h3>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="text-sm text-base-content/60">Organization</p>
                  <p className="font-semibold">{selectedRequest.organizationName}</p>
                </div>
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="text-sm text-base-content/60">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="text-sm text-base-content/60">Request Type</p>
                  {getRequestTypeBadge(selectedRequest.requestType)}
                </div>
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="text-sm text-base-content/60">Plan Change</p>
                  <p className="font-semibold">
                    <span className="capitalize">{selectedRequest.currentTier || "Free"}</span>
                    {" → "}
                    <span className="capitalize">{selectedRequest.requestedTier}</span>
                  </p>
                </div>
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="text-sm text-base-content/60">Requested By</p>
                  <p className="font-semibold">{selectedRequest.requestedByName}</p>
                  <p className="text-xs text-base-content/60">{selectedRequest.requestedByEmail}</p>
                </div>
                <div className="bg-base-200 p-4 rounded-lg">
                  <p className="text-sm text-base-content/60">Submitted</p>
                  <p className="font-semibold">{formatDate(selectedRequest.createdAt)}</p>
                </div>
              </div>

              {selectedRequest.status !== "pending" && (
                <div className="divider">Review Details</div>
              )}

              {selectedRequest.reviewedAt && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-base-200 p-4 rounded-lg">
                    <p className="text-sm text-base-content/60">Reviewed By</p>
                    <p className="font-semibold">{selectedRequest.reviewedByName}</p>
                  </div>
                  <div className="bg-base-200 p-4 rounded-lg">
                    <p className="text-sm text-base-content/60">Reviewed At</p>
                    <p className="font-semibold">{formatDate(selectedRequest.reviewedAt)}</p>
                  </div>
                </div>
              )}

              {selectedRequest.rejectionReason && (
                <div className="bg-error/10 p-4 rounded-lg border border-error/30">
                  <p className="text-sm text-error">Rejection Reason</p>
                  <p className="font-semibold">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {selectedRequest.reviewNotes && (
                <div className="bg-success/10 p-4 rounded-lg border border-success/30">
                  <p className="text-sm text-success">Approval Notes</p>
                  <p className="font-semibold">{selectedRequest.reviewNotes}</p>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
              >
                Close
              </button>
              <Link
                to={`/super-admin/organizations/${selectedRequest.organizationId}`}
                className="btn btn-primary"
              >
                View Organization
              </Link>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDetailsModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionApprovalDashboard;
