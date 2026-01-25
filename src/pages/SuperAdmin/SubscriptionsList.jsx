import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  FaCreditCard,
  FaSearch,
  FaEye,
  FaEdit,
  FaBuilding,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaBan,
} from "react-icons/fa";

const SubscriptionsList = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("filter") || "all");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);

  // Fetch subscriptions
  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-subscriptions", page, limit, searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const response = await axiosSecure.get(`/super-admin/subscriptions?${params}`);
      return response.data.data;
    },
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async ({ subscriptionId, reason }) => {
      return axiosSecure.put(`/super-admin/subscriptions/${subscriptionId}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-subscriptions"]);
      setShowCancelModal(false);
      setSelectedSubscription(null);
    },
  });

  // Extend subscription mutation
  const extendMutation = useMutation({
    mutationFn: async ({ subscriptionId, days }) => {
      return axiosSecure.put(`/super-admin/subscriptions/${subscriptionId}/extend`, { days });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-subscriptions"]);
      setShowExtendModal(false);
      setSelectedSubscription(null);
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="badge badge-success badge-sm flex items-center gap-1">
            <FaCheckCircle className="text-xs" /> Active
          </span>
        );
      case "trial":
        return (
          <span className="badge badge-warning badge-sm flex items-center gap-1">
            <FaClock className="text-xs" /> Trial
          </span>
        );
      case "expired":
        return (
          <span className="badge badge-error badge-sm flex items-center gap-1">
            <FaExclamationTriangle className="text-xs" /> Expired
          </span>
        );
      case "cancelled":
        return (
          <span className="badge badge-ghost badge-sm flex items-center gap-1">
            <FaBan className="text-xs" /> Cancelled
          </span>
        );
      default:
        return <span className="badge badge-ghost badge-sm">{status}</span>;
    }
  };

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return <span className="text-error">Expired</span>;
    if (days <= 7) return <span className="text-error">{days} days</span>;
    if (days <= 30) return <span className="text-warning">{days} days</span>;
    return <span className="text-success">{days} days</span>;
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading subscriptions: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaCreditCard className="text-primary" />
            Subscriptions
          </h1>
          <p className="text-base-content/60 mt-1">Manage organization subscriptions</p>
        </div>
        <Link to="/super-admin/plans" className="btn btn-primary btn-sm sm:btn-md">
          Manage Plans
        </Link>
      </div>

      {/* Stats */}
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-title">Active</div>
          <div className="stat-value text-success text-2xl">{data?.stats?.active || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Trial</div>
          <div className="stat-value text-warning text-2xl">{data?.stats?.trial || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Expired</div>
          <div className="stat-value text-error text-2xl">{data?.stats?.expired || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value text-2xl">${data?.stats?.totalRevenue?.toLocaleString() || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search by organization name..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              className="select select-bordered"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Remaining</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.subscriptions?.length > 0 ? (
                    data.subscriptions.map((sub) => (
                      <tr key={sub._id} className="hover">
                        <td>
                          <Link
                            to={`/super-admin/organizations/${sub.organizationId}`}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <FaBuilding />
                            {sub.organizationName || "Unknown"}
                          </Link>
                        </td>
                        <td>
                          <div className="font-medium">{sub.planName || "N/A"}</div>
                          <div className="text-xs text-base-content/60">{sub.billingCycle || "monthly"}</div>
                        </td>
                        <td>{getStatusBadge(sub.status)}</td>
                        <td>
                          <div className="flex items-center gap-1 text-sm">
                            <FaCalendarAlt className="text-base-content/40" />
                            {new Date(sub.startDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-sm">
                            <FaCalendarAlt className="text-base-content/40" />
                            {new Date(sub.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td>{getDaysRemaining(sub.endDate)}</td>
                        <td>
                          <div className="font-medium">${sub.amount?.toFixed(2) || "0.00"}</div>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs tooltip"
                              data-tip="View Details"
                              onClick={() => navigate(`/super-admin/subscriptions/${sub._id}`)}
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs tooltip text-success"
                              data-tip="Extend"
                              onClick={() => {
                                setSelectedSubscription(sub);
                                setShowExtendModal(true);
                              }}
                            >
                              <FaCalendarAlt />
                            </button>
                            {sub.status !== "cancelled" && (
                              <button
                                className="btn btn-ghost btn-xs tooltip text-error"
                                data-tip="Cancel"
                                onClick={() => {
                                  setSelectedSubscription(sub);
                                  setShowCancelModal(true);
                                }}
                              >
                                <FaBan />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-base-content/60">
                        No subscriptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && (
            <div className="flex justify-center items-center gap-2 p-4 border-t border-base-300">
              <button
                className="btn btn-sm btn-outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {page} of {data.pagination.pages || 1}
              </span>
              <button
                className="btn btn-sm btn-outline"
                disabled={page >= (data.pagination.pages || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Cancel Subscription</h3>
            <p className="py-4">
              Cancel subscription for <strong>{selectedSubscription?.organizationName}</strong>?
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                cancelMutation.mutate({
                  subscriptionId: selectedSubscription._id,
                  reason: e.target.reason.value,
                });
              }}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason</span>
                </label>
                <textarea
                  name="reason"
                  className="textarea textarea-bordered"
                  placeholder="Enter reason..."
                  required
                ></textarea>
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowCancelModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-error" disabled={cancelMutation.isPending}>
                  {cancelMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Cancel Subscription"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowCancelModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Extend Modal */}
      {showExtendModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Extend Subscription</h3>
            <p className="py-4">
              Extend subscription for <strong>{selectedSubscription?.organizationName}</strong>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                extendMutation.mutate({
                  subscriptionId: selectedSubscription._id,
                  days: parseInt(e.target.days.value),
                });
              }}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Days to extend</span>
                </label>
                <input
                  type="number"
                  name="days"
                  className="input input-bordered"
                  min="1"
                  max="365"
                  defaultValue="30"
                  required
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowExtendModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={extendMutation.isPending}>
                  {extendMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Extend"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowExtendModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default SubscriptionsList;
