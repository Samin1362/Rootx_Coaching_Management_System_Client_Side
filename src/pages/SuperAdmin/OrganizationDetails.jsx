import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaBuilding,
  FaArrowLeft,
  FaEdit,
  FaUsers,
  FaCreditCard,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaBan,
  FaCheckCircle,
  FaTrash,
  FaClock,
  FaChartLine,
} from "react-icons/fa";

const OrganizationDetails = () => {
  const { orgId: id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch organization details
  const { data: organization, isLoading, error } = useQuery({
    queryKey: ["super-admin-organization", id],
    queryFn: async () => {
      const response = await axiosSecure.get(`/super-admin/organizations/${id}`);
      return response.data.data;
    },
  });

  // Fetch organization users
  const { data: usersData } = useQuery({
    queryKey: ["super-admin-organization-users", id],
    queryFn: async () => {
      const response = await axiosSecure.get(`/super-admin/organizations/${id}/users`);
      return response.data.data;
    },
  });

  // Suspend mutation
  const suspendMutation = useMutation({
    mutationFn: async (reason) => {
      return axiosSecure.put(`/super-admin/organizations/${id}/suspend`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-organization", id]);
      setShowSuspendModal(false);
    },
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: async () => {
      return axiosSecure.put(`/super-admin/organizations/${id}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-organization", id]);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return axiosSecure.delete(`/super-admin/organizations/${id}`);
    },
    onSuccess: () => {
      navigate("/super-admin/organizations");
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="badge badge-success">Active</span>;
      case "trial":
        return <span className="badge badge-warning">Trial</span>;
      case "suspended":
        return <span className="badge badge-error">Suspended</span>;
      case "pending":
        return <span className="badge badge-info">Pending</span>;
      default:
        return <span className="badge badge-ghost">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading organization: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <FaBuilding className="text-primary" />
              {organization?.name}
            </h1>
            <p className="text-base-content/60 mt-1">{organization?.subdomain || organization?._id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/super-admin/organizations/${id}/edit`}
            className="btn btn-outline btn-sm"
          >
            <FaEdit className="mr-1" /> Edit
          </Link>
          {organization?.status === "suspended" ? (
            <button
              className="btn btn-success btn-sm"
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
            >
              <FaCheckCircle className="mr-1" /> Activate
            </button>
          ) : (
            <button
              className="btn btn-warning btn-sm"
              onClick={() => setShowSuspendModal(true)}
            >
              <FaBan className="mr-1" /> Suspend
            </button>
          )}
          <button
            className="btn btn-error btn-sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <FaTrash className="mr-1" /> Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title">Organization Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <FaBuilding className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Organization Name</p>
                    <p className="font-medium">{organization?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaGlobe className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Subdomain</p>
                    <p className="font-medium">{organization?.subdomain || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Owner Email</p>
                    <p className="font-medium">{organization?.owner?.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Phone</p>
                    <p className="font-medium">{organization?.phone || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Created</p>
                    <p className="font-medium">
                      {new Date(organization?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Status</p>
                    {getStatusBadge(organization?.status)}
                  </div>
                </div>
              </div>
              {organization?.address && Object.keys(organization.address).length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-base-content/60">Address</p>
                  <p className="font-medium">
                    {[
                      organization.address.street,
                      organization.address.city,
                      organization.address.state,
                      organization.address.country,
                      organization.address.zip
                    ].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title">
                  <FaUsers className="text-primary" /> Organization Users
                </h2>
                <span className="badge badge-primary">{usersData?.users?.length || 0} users</span>
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="table table-zebra table-sm">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData?.users?.length > 0 ? (
                      usersData.users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar placeholder">
                                <div className="bg-primary/10 text-primary rounded-full w-8">
                                  <span>{user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}</span>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">{user.name || "N/A"}</div>
                                <div className="text-xs text-base-content/60">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-outline badge-sm">{user.role}</span>
                          </td>
                          <td>
                            <span className={`badge badge-sm ${user.isActive ? 'badge-success' : 'badge-ghost'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="text-sm text-base-content/60">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-base-content/60">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Info */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">
                <FaCreditCard className="text-primary" /> Subscription
              </h2>
              <div className="space-y-3 mt-4">
                <div>
                  <p className="text-xs text-base-content/60">Plan</p>
                  <p className="font-medium">{organization?.subscription?.planName || "No Plan"}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Status</p>
                  <span className={`badge ${
                    organization?.subscription?.status === 'active' ? 'badge-success' :
                    organization?.subscription?.status === 'trial' ? 'badge-warning' :
                    'badge-ghost'
                  }`}>
                    {organization?.subscription?.status || "N/A"}
                  </span>
                </div>
                {organization?.subscription?.endDate && (
                  <div>
                    <p className="text-xs text-base-content/60">Expires</p>
                    <p className="font-medium">
                      {new Date(organization?.subscription?.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <Link
                  to={`/super-admin/subscriptions?organization=${id}`}
                  className="btn btn-outline btn-sm w-full mt-2"
                >
                  Manage Subscription
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">
                <FaChartLine className="text-primary" /> Statistics
              </h2>
              <div className="stats stats-vertical w-full mt-4">
                <div className="stat px-0">
                  <div className="stat-title">Total Users</div>
                  <div className="stat-value text-2xl">{organization?.stats?.totalUsers || 0}</div>
                </div>
                <div className="stat px-0">
                  <div className="stat-title">Students</div>
                  <div className="stat-value text-2xl">{organization?.stats?.totalStudents || 0}</div>
                </div>
                <div className="stat px-0">
                  <div className="stat-title">Batches</div>
                  <div className="stat-value text-2xl">{organization?.stats?.totalBatches || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Suspend Organization</h3>
            <p className="py-4">
              Are you sure you want to suspend <strong>{organization?.name}</strong>?
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                suspendMutation.mutate(e.target.reason.value);
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
                <button type="button" className="btn" onClick={() => setShowSuspendModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning" disabled={suspendMutation.isPending}>
                  {suspendMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : "Suspend"}
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
              Are you sure you want to permanently delete <strong>{organization?.name}</strong>? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : "Delete"}
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

export default OrganizationDetails;
