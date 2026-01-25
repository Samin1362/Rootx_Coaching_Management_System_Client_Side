import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { Link, useNavigate } from "react-router";
import {
  FaBuilding,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaFilter,
  FaUsers,
  FaCreditCard,
} from "react-icons/fa";

const OrganizationsList = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  // Fetch organizations
  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-organizations", page, limit, searchTerm, statusFilter, subscriptionFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(subscriptionFilter !== "all" && { subscriptionStatus: subscriptionFilter }),
      });
      const response = await axiosSecure.get(`/super-admin/organizations?${params}`);
      return response.data.data;
    },
  });

  // Suspend organization mutation
  const suspendMutation = useMutation({
    mutationFn: async ({ orgId, reason }) => {
      return axiosSecure.put(`/super-admin/organizations/${orgId}/suspend`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-organizations"]);
      setShowSuspendModal(false);
      setSelectedOrg(null);
    },
  });

  // Activate organization mutation
  const activateMutation = useMutation({
    mutationFn: async (orgId) => {
      return axiosSecure.put(`/super-admin/organizations/${orgId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-organizations"]);
    },
  });

  // Delete organization mutation
  const deleteMutation = useMutation({
    mutationFn: async (orgId) => {
      return axiosSecure.delete(`/super-admin/organizations/${orgId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-organizations"]);
      setShowDeleteModal(false);
      setSelectedOrg(null);
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="badge badge-success badge-sm">Active</span>;
      case "trial":
        return <span className="badge badge-warning badge-sm">Trial</span>;
      case "suspended":
        return <span className="badge badge-error badge-sm">Suspended</span>;
      case "pending":
        return <span className="badge badge-info badge-sm">Pending</span>;
      default:
        return <span className="badge badge-ghost badge-sm">{status}</span>;
    }
  };

  const getSubscriptionBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="badge badge-success badge-outline badge-sm">Active</span>;
      case "trial":
        return <span className="badge badge-warning badge-outline badge-sm">Trial</span>;
      case "expired":
        return <span className="badge badge-error badge-outline badge-sm">Expired</span>;
      case "cancelled":
        return <span className="badge badge-ghost badge-outline badge-sm">Cancelled</span>;
      default:
        return <span className="badge badge-ghost badge-outline badge-sm">{status || 'N/A'}</span>;
    }
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading organizations: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaBuilding className="text-primary" />
            Organizations
          </h1>
          <p className="text-base-content/60 mt-1">Manage all platform organizations</p>
        </div>
        <Link to="/super-admin/organizations/create" className="btn btn-primary btn-sm sm:btn-md">
          <FaPlus className="mr-1" /> New Organization
        </Link>
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
                  placeholder="Search organizations..."
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
            <div className="flex gap-2">
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
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>

              <select
                className="select select-bordered"
                value={subscriptionFilter}
                onChange={(e) => {
                  setSubscriptionFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Subscriptions</option>
                <option value="active">Active Sub</option>
                <option value="trial">Trial Sub</option>
                <option value="expired">Expired Sub</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
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
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Subscription</th>
                    <th>Users</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.organizations?.length > 0 ? (
                    data.organizations.map((org) => (
                      <tr key={org._id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-primary/10 text-primary rounded-lg w-10">
                                <span className="text-lg">{org.name?.charAt(0)?.toUpperCase()}</span>
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{org.name}</div>
                              <div className="text-sm text-base-content/60">{org.subdomain || org._id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div>{org.owner?.name || "N/A"}</div>
                            <div className="text-base-content/60">{org.owner?.email || "N/A"}</div>
                          </div>
                        </td>
                        <td>{getStatusBadge(org.status)}</td>
                        <td>
                          <div className="flex flex-col gap-1">
                            {getSubscriptionBadge(org.subscriptionStatus)}
                            {org.planName && (
                              <span className="text-xs text-base-content/60">{org.planName}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <FaUsers className="text-base-content/40" />
                            <span>{org.userCount || 0}</span>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm text-base-content/60">
                            {new Date(org.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs tooltip"
                              data-tip="View Details"
                              onClick={() => navigate(`/super-admin/organizations/${org._id}`)}
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs tooltip"
                              data-tip="Edit"
                              onClick={() => navigate(`/super-admin/organizations/${org._id}/edit`)}
                            >
                              <FaEdit />
                            </button>
                            {org.status === "suspended" ? (
                              <button
                                className="btn btn-ghost btn-xs text-success tooltip"
                                data-tip="Activate"
                                onClick={() => activateMutation.mutate(org._id)}
                              >
                                <FaCheckCircle />
                              </button>
                            ) : (
                              <button
                                className="btn btn-ghost btn-xs text-warning tooltip"
                                data-tip="Suspend"
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setShowSuspendModal(true);
                                }}
                              >
                                <FaBan />
                              </button>
                            )}
                            <button
                              className="btn btn-ghost btn-xs text-error tooltip"
                              data-tip="Delete"
                              onClick={() => {
                                setSelectedOrg(org);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-base-content/60">
                        No organizations found
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

      {/* Suspend Modal */}
      {showSuspendModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Suspend Organization</h3>
            <p className="py-4">
              Are you sure you want to suspend <strong>{selectedOrg?.name}</strong>? This will prevent all users from accessing the organization.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const reason = e.target.reason.value;
                suspendMutation.mutate({ orgId: selectedOrg._id, reason });
              }}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason for suspension</span>
                </label>
                <textarea
                  name="reason"
                  className="textarea textarea-bordered"
                  placeholder="Enter reason..."
                  required
                ></textarea>
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSelectedOrg(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-warning"
                  disabled={suspendMutation.isPending}
                >
                  {suspendMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Suspend"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowSuspendModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Organization</h3>
            <p className="py-4">
              Are you sure you want to delete <strong>{selectedOrg?.name}</strong>? This action cannot be undone and will permanently delete all organization data.
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedOrg(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(selectedOrg._id)}
              >
                {deleteMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowDeleteModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default OrganizationsList;
