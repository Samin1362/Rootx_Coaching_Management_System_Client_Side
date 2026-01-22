import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaShieldAlt,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const UserManagement = () => {
  const axiosSecure = useAxiosSecure();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "staff",
    phone: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await axiosSecure.get("/users");
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      await axiosSecure.post("/users/invite", inviteForm);

      // Reset form and close modal
      setInviteForm({ name: "", email: "", role: "staff", phone: "" });
      setShowInviteModal(false);

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error("Error inviting user:", error);
      setError(error.response?.data?.message || error.message || "Failed to invite user. Please try again.");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setError(null);
      await axiosSecure.patch(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      setError(error.response?.data?.message || error.message || "Failed to update user role. Please try again.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      try {
        setError(null);
        await axiosSecure.delete(`/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        setError(error.response?.data?.message || error.message || "Failed to delete user. Please try again.");
      }
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      org_owner: "badge-error",
      admin: "badge-warning",
      manager: "badge-info",
      teacher: "badge-success",
      staff: "badge-ghost",
    };
    return badges[role] || "badge-ghost";
  };

  const getRoleIcon = (role) => {
    return <FaShieldAlt className="inline mr-1" />;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setError(null); fetchUsers(); }} className="btn btn-sm btn-ghost">
                Retry
              </button>
              <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <FaUsers className="text-primary" />
            User Management
          </h1>
          <p className="text-base-content/60 mt-1">
            Manage your organization's team members
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn btn-primary text-white shadow-lg hover:shadow-xl"
        >
          <FaUserPlus />
          Invite User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-xl rounded-lg">
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{users.length}</div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-lg">
          <div className="stat-title">Admins</div>
          <div className="stat-value text-warning">
            {users.filter((u) => u.role === "admin" || u.role === "org_owner").length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-lg">
          <div className="stat-title">Teachers</div>
          <div className="stat-value text-success">
            {users.filter((u) => u.role === "teacher").length}
          </div>
        </div>
        <div className="stat bg-base-100 shadow-xl rounded-lg">
          <div className="stat-title">Staff</div>
          <div className="stat-value text-info">
            {users.filter((u) => u.role === "staff").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="form-control flex-1">
              <div className="input-group">
                <span className="bg-base-200">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="input input-bordered w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="form-control w-full sm:w-48">
              <select
                className="select select-bordered w-full"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="org_owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-white rounded-full w-10 h-10 ring-2 ring-primary/20">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.name}
                                className="rounded-full"
                                onError={(e) => {
                                  e.target.outerHTML = `<span class="text-lg">${user.name?.charAt(0).toUpperCase()}</span>`;
                                }}
                              />
                            ) : (
                              <span className="text-lg">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm text-base-content/60">
                            {user.phone || "No phone"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-base-content/40" />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <div className={`badge ${getRoleBadge(user.role)} gap-2`}>
                        {getRoleIcon(user.role)}
                        {user.role?.replace("_", " ").toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <div
                        className={`badge ${
                          user.status === "active" ? "badge-success" : "badge-error"
                        }`}
                      >
                        {user.status}
                      </div>
                    </td>
                    <td>
                      {user.lastActivity
                        ? new Date(user.lastActivity).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {user.role !== "org_owner" && (
                          <>
                            <div className="dropdown dropdown-end">
                              <label tabIndex={0} className="btn btn-ghost btn-sm">
                                <FaEdit />
                              </label>
                              <ul
                                tabIndex={0}
                                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                              >
                                <li>
                                  <a onClick={() => handleUpdateRole(user._id, "admin")}>
                                    Change to Admin
                                  </a>
                                </li>
                                <li>
                                  <a onClick={() => handleUpdateRole(user._id, "manager")}>
                                    Change to Manager
                                  </a>
                                </li>
                                <li>
                                  <a onClick={() => handleUpdateRole(user._id, "teacher")}>
                                    Change to Teacher
                                  </a>
                                </li>
                                <li>
                                  <a onClick={() => handleUpdateRole(user._id, "staff")}>
                                    Change to Staff
                                  </a>
                                </li>
                              </ul>
                            </div>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn btn-ghost btn-sm text-error"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Invite New User</h3>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input input-bordered"
                  value={inviteForm.name}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="input input-bordered"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone (Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+880 1712-345678"
                  className="input input-bordered"
                  value={inviteForm.phone}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, phone: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  className="select select-bordered"
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, role: e.target.value })
                  }
                >
                  <option value="staff">Staff</option>
                  <option value="teacher">Teacher</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-white">
                  <FaUserPlus />
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowInviteModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
