import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { Link, useNavigate } from "react-router";
import {
  FaUsers,
  FaSearch,
  FaEye,
  FaBan,
  FaCheckCircle,
  FaUserShield,
  FaBuilding,
  FaEnvelope,
} from "react-icons/fa";

const PlatformUsers = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-users", page, limit, searchTerm, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const response = await axiosSecure.get(`/super-admin/users?${params}`);
      return response.data.data;
    },
  });

  // Ban user mutation
  const banMutation = useMutation({
    mutationFn: async ({ userId, reason }) => {
      return axiosSecure.put(`/super-admin/users/${userId}/ban`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-users"]);
      setShowBanModal(false);
      setSelectedUser(null);
    },
  });

  // Unban user mutation
  const unbanMutation = useMutation({
    mutationFn: async (userId) => {
      return axiosSecure.put(`/super-admin/users/${userId}/unban`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-users"]);
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      return axiosSecure.put(`/super-admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-users"]);
      setShowRoleModal(false);
      setSelectedUser(null);
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
      <span className={`badge badge-sm ${roleStyles[role] || "badge-ghost"}`}>
        {role?.replace("_", " ")}
      </span>
    );
  };

  const getStatusBadge = (status, isBanned) => {
    if (isBanned) {
      return <span className="badge badge-error badge-sm">Banned</span>;
    }
    return status === "active" ? (
      <span className="badge badge-success badge-sm">Active</span>
    ) : (
      <span className="badge badge-ghost badge-sm">{status}</span>
    );
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading users: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaUsers className="text-primary" />
            Platform Users
          </h1>
          <p className="text-base-content/60 mt-1">Manage all users across organizations</p>
        </div>
        <div className="stats shadow">
          <div className="stat py-2 px-4">
            <div className="stat-title text-xs">Total Users</div>
            <div className="stat-value text-lg">{data?.pagination?.total || 0}</div>
          </div>
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
                  placeholder="Search by name, email..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                className="select select-bordered"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>

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
                <option value="banned">Banned</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
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
                    <th>User</th>
                    <th>Organization</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users?.length > 0 ? (
                    data.users.map((user) => (
                      <tr key={user._id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-primary/10 text-primary rounded-full w-10">
                                <span className="text-lg">
                                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{user.name || "N/A"}</div>
                              <div className="text-sm text-base-content/60 flex items-center gap-1">
                                <FaEnvelope className="text-xs" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {user.organizationName ? (
                            <Link
                              to={`/super-admin/organizations/${user.organizationId}`}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <FaBuilding className="text-xs" />
                              {user.organizationName}
                            </Link>
                          ) : (
                            <span className="text-base-content/40">No organization</span>
                          )}
                        </td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{getStatusBadge(user.status, user.isBanned)}</td>
                        <td>
                          <div className="text-sm text-base-content/60">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="text-sm text-base-content/60">
                            {user.lastActiveAt
                              ? new Date(user.lastActiveAt).toLocaleDateString()
                              : "Never"}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs tooltip"
                              data-tip="View Details"
                              onClick={() => navigate(`/super-admin/users/${user._id}`)}
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs tooltip"
                              data-tip="Change Role"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowRoleModal(true);
                              }}
                            >
                              <FaUserShield />
                            </button>
                            {user.isBanned ? (
                              <button
                                className="btn btn-ghost btn-xs text-success tooltip"
                                data-tip="Unban"
                                onClick={() => unbanMutation.mutate(user._id)}
                              >
                                <FaCheckCircle />
                              </button>
                            ) : (
                              <button
                                className="btn btn-ghost btn-xs text-error tooltip"
                                data-tip="Ban"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowBanModal(true);
                                }}
                                disabled={user.role === "super_admin"}
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
                      <td colSpan="7" className="text-center py-8 text-base-content/60">
                        No users found
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

      {/* Ban Modal */}
      {showBanModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Ban User</h3>
            <p className="py-4">
              Are you sure you want to ban <strong>{selectedUser?.name || selectedUser?.email}</strong>?
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                banMutation.mutate({
                  userId: selectedUser._id,
                  reason: e.target.reason.value,
                });
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
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUser(null);
                  }}
                >
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
              Change role for <strong>{selectedUser?.name || selectedUser?.email}</strong>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateRoleMutation.mutate({
                  userId: selectedUser._id,
                  role: e.target.role.value,
                });
              }}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Select Role</span>
                </label>
                <select
                  name="role"
                  className="select select-bordered"
                  defaultValue={selectedUser?.role}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updateRoleMutation.isPending}>
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

export default PlatformUsers;
