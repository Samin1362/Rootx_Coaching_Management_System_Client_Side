import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaClipboardList,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaBuilding,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const ActivityLogsViewer = () => {
  const axiosSecure = useAxiosSecure();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch activity logs
  const { data, isLoading, error } = useQuery({
    queryKey: ["super-admin-activity-logs", page, limit, searchTerm, actionFilter, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(actionFilter !== "all" && { action: actionFilter }),
        ...(dateFilter !== "all" && { dateRange: dateFilter }),
      });
      const response = await axiosSecure.get(`/super-admin/activity-logs?${params}`);
      return response.data.data;
    },
  });

  const getActionBadge = (action) => {
    if (action?.includes("create")) {
      return (
        <span className="badge badge-success badge-sm flex items-center gap-1">
          <FaCheckCircle className="text-xs" /> {action}
        </span>
      );
    }
    if (action?.includes("delete") || action?.includes("ban") || action?.includes("suspend")) {
      return (
        <span className="badge badge-error badge-sm flex items-center gap-1">
          <FaTimesCircle className="text-xs" /> {action}
        </span>
      );
    }
    if (action?.includes("update") || action?.includes("edit")) {
      return (
        <span className="badge badge-info badge-sm flex items-center gap-1">
          <FaInfoCircle className="text-xs" /> {action}
        </span>
      );
    }
    if (action?.includes("warning") || action?.includes("error")) {
      return (
        <span className="badge badge-warning badge-sm flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" /> {action}
        </span>
      );
    }
    return <span className="badge badge-ghost badge-sm">{action}</span>;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    
    // Handle MongoDB extended JSON format { $date: "..." }
    const dateValue = date?.$date ? date.$date : date;
    
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "Invalid Date";
    
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading activity logs: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaClipboardList className="text-primary" />
            Activity Logs
          </h1>
          <p className="text-base-content/60 mt-1">Track all super admin actions and changes</p>
        </div>
        <div className="stats shadow">
          <div className="stat py-2 px-4">
            <div className="stat-title text-xs">Total Logs</div>
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
                  placeholder="Search by action, admin, target..."
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
            <div className="flex gap-2 flex-wrap">
              <select
                className="select select-bordered"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="suspend">Suspend</option>
                <option value="activate">Activate</option>
                <option value="ban">Ban</option>
                <option value="settings">Settings</option>
              </select>

              <select
                className="select select-bordered"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Admin</th>
                    <th>Target</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.logs?.length > 0 ? (
                    data.logs.map((log) => (
                      <tr
                        key={log._id}
                        className="hover cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <FaCalendarAlt className="text-base-content/40" />
                            {formatDate(log.createdAt || log.timestamp)}
                          </div>
                        </td>
                        <td>{getActionBadge(log.action)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaUser className="text-base-content/40" />
                            <div>
                              <div className="font-medium text-sm">
                                {log.user?.email || log.userEmail || log.userName || log.adminEmail || "System"}
                              </div>
                              {(log.user?._id || log.userId || log.adminId) && (
                                <div className="text-xs text-base-content/60">
                                  ID: {(log.user?._id || log.userId || log.adminId).toString().slice(-8)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <FaBuilding className="text-base-content/40" />
                            <div>
                              <div className="font-medium text-sm">
                                {log.organization?.name || log.organizationName || log.resource || log.targetType || "N/A"}
                              </div>
                              {(log.resourceId || log.targetId) && (
                                <div className="text-xs text-base-content/60">
                                  ID: {(log.resourceId || log.targetId).toString().slice(-8)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                          >
                            <FaInfoCircle /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-base-content/60">
                        No activity logs found
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

      {/* Log Details Modal */}
      {selectedLog && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaInfoCircle className="text-primary" /> Activity Log Details
            </h3>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-base-content/60">Timestamp</p>
                  <p className="font-medium">{formatDate(selectedLog.createdAt || selectedLog.timestamp)}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Action</p>
                  {getActionBadge(selectedLog.action)}
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Admin</p>
                  <p className="font-medium">{selectedLog.user?.email || selectedLog.userEmail || selectedLog.userName || selectedLog.adminEmail || "System"}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Admin ID</p>
                  <p className="font-medium font-mono text-sm">{selectedLog.user?._id || selectedLog.userId || selectedLog.adminId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Target Type</p>
                  <p className="font-medium">{selectedLog.resource || selectedLog.targetType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Target ID</p>
                  <p className="font-medium font-mono text-sm">{selectedLog.resourceId || selectedLog.targetId || "N/A"}</p>
                </div>
              </div>

              {(selectedLog.changes || selectedLog.details) && (
                <div>
                  <p className="text-xs text-base-content/60 mb-2">Details/Changes</p>
                  <div className="bg-base-200 rounded-lg p-3">
                    <pre className="text-sm overflow-auto max-h-60">
                      {JSON.stringify(selectedLog.changes || selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedLog.ipAddress && (
                <div>
                  <p className="text-xs text-base-content/60">IP Address</p>
                  <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <p className="text-xs text-base-content/60">User Agent</p>
                  <p className="text-sm text-base-content/80 truncate">{selectedLog.userAgent}</p>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedLog(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default ActivityLogsViewer;
