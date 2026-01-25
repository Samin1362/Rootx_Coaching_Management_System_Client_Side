import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaUser,
  FaArrowLeft,
  FaEdit,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaBan,
  FaCheckCircle,
  FaClock,
  FaUserShield,
  FaSignInAlt,
  FaHistory,
} from "react-icons/fa";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [showBanModal, setShowBanModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Fetch user details
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["super-admin-user", userId],
    queryFn: async () => {
      const response = await axiosSecure.get(`/super-admin/users/${userId}`);
      return response.data.data;
    },
  });

  // Fetch user activity
  const { data: activityData } = useQuery({
    queryKey: ["super-admin-user-activity", userId],
    queryFn: async () => {
      const response = await axiosSecure.get(`/super-admin/users/${userId}/activity?limit=10`);
      return response.data.data;
    },
  });

  // Ban user mutation
  const banMutation = useMutation({
    mutationFn: async (reason) => {
      return axiosSecure.put(`/super-admin/users/${userId}/ban`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-user", userId]);
      setShowBanModal(false);
    },
  });

  // Unban user mutation
  const unbanMutation = useMutation({
    mutationFn: async () => {
      return axiosSecure.put(`/super-admin/users/${userId}/unban`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-user", userId]);
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (role) => {
      return axiosSecure.put(`/super-admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-user", userId]);
      setShowRoleModal(false);
    },
  });

  // Impersonate user mutation
  const impersonateMutation = useMutation({
    mutationFn: async () => {
      return axiosSecure.post(`/super-admin/users/${userId}/impersonate`);
    },
    onSuccess: (response) => {
      // Open impersonation URL in new tab
      if (response.data?.data?.impersonationUrl) {
        window.open(response.data.data.impersonationUrl, "_blank");
      }
    },
  });

  const getRoleBadge = (role) => {
    const roleStyles = {
      super_admin: "badge-error",
      admin: "badge-warning",
      teacher: "badge-info",
      student: "badge-success",
      staff: "badge-secondary",
    };
    return (
      <span className={`badge ${roleStyles[role] || "badge-ghost"}`}>
        {role?.replace("_", " ")}
      </span>
    );
  };

  const getStatusBadge = (status, isBanned) => {
    if (isBanned) {
      return <span className="badge badge-error">Banned</span>;
    }
    return status === "active" ? (
      <span className="badge badge-success">Active</span>
    ) : (
      <span className="badge badge-ghost">{status}</span>
    );
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
        <span>Error loading user: {error.message}</span>
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
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-primary/10 text-primary rounded-full w-16">
                <span className="text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{user?.name || "Unknown User"}</h1>
              <p className="text-base-content/60">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowRoleModal(true)}
            disabled={user?.role === "super_admin"}
          >
            <FaUserShield className="mr-1" /> Change Role
          </button>
          {user?.isBanned ? (
            <button
              className="btn btn-success btn-sm"
              onClick={() => unbanMutation.mutate()}
              disabled={unbanMutation.isPending}
            >
              <FaCheckCircle className="mr-1" /> Unban
            </button>
          ) : (
            <button
              className="btn btn-warning btn-sm"
              onClick={() => setShowBanModal(true)}
              disabled={user?.role === "super_admin"}
            >
              <FaBan className="mr-1" /> Ban
            </button>
          )}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => impersonateMutation.mutate()}
            disabled={impersonateMutation.isPending || user?.role === "super_admin"}
          >
            <FaSignInAlt className="mr-1" /> Impersonate
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title">User Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <FaUser className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Full Name</p>
                    <p className="font-medium">{user?.name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Phone</p>
                    <p className="font-medium">{user?.phone || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaUserShield className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Role</p>
                    {getRoleBadge(user?.role)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Joined</p>
                    <p className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="text-primary" />
                  <div>
                    <p className="text-xs text-base-content/60">Status</p>
                    {getStatusBadge(user?.status, user?.isBanned)}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="divider"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-base-content/60">Last Active</p>
                  <p className="font-medium">
                    {user?.lastActiveAt
                      ? new Date(user.lastActiveAt).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Last Login</p>
                  <p className="font-medium">
                    {user?.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title">
                  <FaHistory className="text-primary" /> Recent Activity
                </h2>
              </div>
              <div className="space-y-2 mt-4">
                {activityData?.logs?.length > 0 ? (
                  activityData.logs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-base-content/60">
                          {log.details?.targetName || log.targetType || "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-base-content/60">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-base-content/40">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-base-content/60 py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organization Info */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">
                <FaBuilding className="text-primary" /> Organization
              </h2>
              {user?.organizationId ? (
                <div className="space-y-3 mt-4">
                  <div>
                    <p className="text-xs text-base-content/60">Organization Name</p>
                    <Link
                      to={`/super-admin/organizations/${user.organizationId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {user.organizationName || "View Organization"}
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/60">Organization Role</p>
                    <p className="font-medium capitalize">{user.role?.replace("_", " ")}</p>
                  </div>
                </div>
              ) : (
                <p className="text-base-content/60 text-sm mt-4">No organization assigned</p>
              )}
            </div>
          </div>

          {/* Account Stats */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">Account Statistics</h2>
              <div className="stats stats-vertical w-full mt-4">
                <div className="stat px-0">
                  <div className="stat-title">Login Count</div>
                  <div className="stat-value text-2xl">{user?.loginCount || 0}</div>
                </div>
                <div className="stat px-0">
                  <div className="stat-title">Actions Performed</div>
                  <div className="stat-value text-2xl">{user?.actionCount || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ban History */}
          {user?.banHistory?.length > 0 && (
            <div className="card bg-base-100 shadow border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-lg text-error">Ban History</h2>
                <div className="space-y-2 mt-4">
                  {user.banHistory.map((ban, index) => (
                    <div key={index} className="p-3 bg-error/10 rounded-lg">
                      <p className="text-sm font-medium">{ban.reason}</p>
                      <p className="text-xs text-base-content/60">
                        {new Date(ban.bannedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Ban User</h3>
            <p className="py-4">
              Are you sure you want to ban <strong>{user?.name || user?.email}</strong>?
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                banMutation.mutate(e.target.reason.value);
              }}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason for ban</span>
                </label>
                <textarea
                  name="reason"
                  className="textarea textarea-bordered"
                  placeholder="Enter reason..."
                  required
                ></textarea>
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowBanModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-error" disabled={banMutation.isPending}>
                  {banMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Ban User"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowBanModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Change User Role</h3>
            <p className="py-4">
              Change role for <strong>{user?.name || user?.email}</strong>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateRoleMutation.mutate(e.target.role.value);
              }}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Select Role</span>
                </label>
                <select
                  name="role"
                  className="select select-bordered"
                  defaultValue={user?.role}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowRoleModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Update Role"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowRoleModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default UserDetails;
