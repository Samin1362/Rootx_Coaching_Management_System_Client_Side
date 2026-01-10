import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  MdEdit,
  MdSearch,
  MdNavigateNext,
  MdNavigateBefore,
  MdFilterList,
  MdPeople,
  MdPhone,
  MdEmail,
  MdDelete,
  MdPersonAdd,
  MdCalendarToday,
  MdSchool,
  MdExpandMore,
  MdExpandLess,
  MdClose,
  MdWarning,
} from "react-icons/md";
import {
  FaUserPlus,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaBan,
  FaCommentDots,
} from "react-icons/fa";
import { BiSolidPhoneCall } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import { useTranslation } from "react-i18next";

const Admissions = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const notification = useNotification();
  const { t } = useTranslation(["admissions", "common"]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileExpandedRows, setMobileExpandedRows] = useState(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [admissionToDelete, setAdmissionToDelete] = useState(null);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);

  // Toggle mobile row expansion
  const toggleMobileRowExpansion = (rowId) => {
    setMobileExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Delete admission mutation
  const deleteAdmissionMutation = useMutation({
    mutationFn: async (admissionId) => {
      const res = await axiosSecure.delete(`/admissions/${admissionId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admissions"]);
      setDeleteModalOpen(false);
      setAdmissionToDelete(null);
      notification.success(t("admissions:deleteSuccess"), t("common:success"));
    },
    onError: (error) => {
      notification.error(
        error.response?.data?.message || t("admissions:deleteFailed"),
        t("common:error")
      );
    },
  });

  // Handle delete click
  const handleDeleteClick = (admission) => {
    setAdmissionToDelete(admission);
    setDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (admissionToDelete) {
      deleteAdmissionMutation.mutate(admissionToDelete._id);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setAdmissionToDelete(null);
  };

  // Handle follow-up modal
  const handleFollowUpClick = (admission) => {
    setSelectedAdmission(admission);
    setFollowUpModalOpen(true);
  };

  const handleCloseFollowUpModal = () => {
    setFollowUpModalOpen(false);
    setSelectedAdmission(null);
  };

  // Update admission status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ admissionId, status }) => {
      const res = await axiosSecure.patch(`/admissions/${admissionId}`, {
        status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admissions"]);
      notification.success(t("admissions:statusUpdated"), t("common:success"));
    },
    onError: (error) => {
      notification.error(
        error.response?.data?.message || t("admissions:statusUpdateFailed"),
        t("common:error")
      );
    },
  });

  // Handle status change to enrolled
  const handleMarkAsEnrolled = useCallback(
    (admission) => {
      updateStatusMutation.mutate({
        admissionId: admission._id,
        status: "enrolled",
      });
    },
    [updateStatusMutation]
  );

  // Handle status change to rejected
  const handleMarkAsRejected = useCallback(
    (admission) => {
      updateStatusMutation.mutate({
        admissionId: admission._id,
        status: "rejected",
      });
    },
    [updateStatusMutation]
  );

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ["admissions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admissions");
      return res.data;
    },
  });

  // Fetch batches for displaying batch names
  const { data: batches = [] } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data;
    },
  });

  // Helper function to get batch info
  const getBatchInfo = useCallback(
    (batchId) => {
      const batch = batches.find((b) => b._id === batchId);
      if (batch) {
        return `${batch.name} - ${batch.course}`;
      }
      return batchId || "N/A";
    },
    [batches]
  );

  // Filter admissions based on status
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((admission) => {
      const matchesStatus =
        statusFilter === "all" ||
        admission.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesStatus;
    });
  }, [admissions, statusFilter]);

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Prospective Student",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 min-w-50">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <FaUserPlus className="text-primary text-sm" />
            </div>
            <div>
              <div className="font-semibold text-base-content">
                {row.original.name}
              </div>
              <div className="text-xs text-base-content/60 flex items-center gap-1">
                <MdPhone className="text-xs" />
                {row.original.phone}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-sm">
            <MdEmail className="text-base-content/40" />
            <span className="text-base-content">
              {getValue() || (
                <span className="text-base-content/40">Not provided</span>
              )}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "interestedBatchId",
        header: "Interested Batch",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 min-w-50">
            <MdSchool className="text-base-content/40 shrink-0" />
            <span className="badge badge-outline badge-primary font-medium px-3 py-3">
              {getBatchInfo(getValue())}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue()?.toLowerCase();
          return (
            <div
              className={`badge gap-2 font-medium px-3 py-3 ${
                status === "inquiry"
                  ? "badge-info"
                  : status === "follow-up"
                  ? "badge-warning"
                  : status === "enrolled"
                  ? "badge-success"
                  : "badge-error"
              }`}
            >
              {status === "inquiry" ? (
                <FaClock className="text-xs" />
              ) : status === "follow-up" ? (
                <BiSolidPhoneCall className="text-xs" />
              ) : status === "enrolled" ? (
                <FaUserCheck className="text-xs" />
              ) : (
                <FaBan className="text-xs" />
              )}
              <span className="capitalize">{status || "Unknown"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "followUps",
        header: "Follow-ups",
        cell: ({ getValue }) => {
          const followUpCount = getValue()?.length || 0;
          return (
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  followUpCount > 0
                    ? "bg-primary/10 text-primary"
                    : "bg-base-300/50 text-base-content/40"
                }`}
              >
                <FaCommentDots className="text-sm" />
              </div>
              <span className="text-sm font-semibold text-base-content">
                {followUpCount}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-sm">
            <MdCalendarToday className="text-base-content/40" />
            <span className="text-base-content">
              {new Date(getValue()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFollowUpClick(row.original)}
              className="btn btn-ghost btn-sm btn-square text-warning hover:bg-warning/10"
              title="View Follow-ups"
            >
              <BiSolidPhoneCall className="text-lg" />
            </button>
            <button
              onClick={() => handleMarkAsEnrolled(row.original)}
              className="btn btn-ghost btn-sm btn-square text-success hover:bg-success/10"
              title="Mark as Enrolled"
              disabled={row.original.status?.toLowerCase() === "enrolled"}
            >
              <FaUserCheck className="text-lg" />
            </button>
            <button
              onClick={() => handleMarkAsRejected(row.original)}
              className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
              title="Mark as Rejected"
              disabled={row.original.status?.toLowerCase() === "rejected"}
            >
              <FaBan className="text-lg" />
            </button>
            <button
              onClick={() => handleDeleteClick(row.original)}
              className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
              title="Delete"
            >
              <MdDelete className="text-lg" />
            </button>
          </div>
        ),
      },
    ],
    [getBatchInfo, handleMarkAsEnrolled, handleMarkAsRejected]
  );

  const table = useReactTable({
    data: filteredAdmissions,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: admissions.length,
      inquiry: admissions.filter((a) => a.status?.toLowerCase() === "inquiry")
        .length,
      followUp: admissions.filter(
        (a) => a.status?.toLowerCase() === "follow-up"
      ).length,
      enrolled: admissions.filter((a) => a.status?.toLowerCase() === "enrolled")
        .length,
    };
  }, [admissions]);

  if (isLoading) {
    return <Loader message={t("admissions:loadingAdmissions")} />;
  }

  return (
    <div className="min-h-screen bg-base-200/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <FaUserPlus className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                {t("admissions:title")}
              </h1>
              <p className="text-sm text-base-content/60">
                {t("admissions:subtitle")}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-base-100 rounded-xl p-3 border border-base-300/50 shadow-sm">
              <div className="text-2xl font-bold text-base-content">
                {stats.total}
              </div>
              <div className="text-xs text-base-content/60 flex items-center gap-1">
                <MdPeople className="text-sm" />
                {t("common:total")}
              </div>
            </div>
            <div className="bg-info/10 rounded-xl p-3 border border-info/20 shadow-sm">
              <div className="text-2xl font-bold text-info">
                {stats.inquiry}
              </div>
              <div className="text-xs text-info/80 flex items-center gap-1">
                <FaClock className="text-sm" />
                {t("admissions:inquiry")}
              </div>
            </div>
            <div className="bg-warning/10 rounded-xl p-3 border border-warning/20 shadow-sm">
              <div className="text-2xl font-bold text-warning">
                {stats.followUp}
              </div>
              <div className="text-xs text-warning/80 flex items-center gap-1">
                <BiSolidPhoneCall className="text-sm" />
                {t("admissions:followUp")}
              </div>
            </div>
            <div className="bg-success/10 rounded-xl p-3 border border-success/20 shadow-sm">
              <div className="text-2xl font-bold text-success">
                {stats.enrolled}
              </div>
              <div className="text-xs text-success/80 flex items-center gap-1">
                <FaUserCheck className="text-sm" />
                {t("admissions:enrolled")}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-base-content/40" />
                <input
                  type="text"
                  placeholder={t("admissions:searchPlaceholder")}
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="input input-bordered w-full pl-12 pr-4 bg-base-200 focus:bg-base-100 transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <MdFilterList className="text-xl text-base-content/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select select-bordered bg-base-200 focus:bg-base-100 min-w-40"
              >
                <option value="all">{t("admissions:allStatuses")}</option>
                <option value="inquiry">{t("admissions:inquiry")}</option>
                <option value="follow-up">{t("admissions:followUp")}</option>
                <option value="enrolled">{t("admissions:enrolled")}</option>
                <option value="rejected">{t("admissions:rejected")}</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== "all" || globalFilter) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-base-content/60">
                Active filters:
              </span>
              {globalFilter && (
                <div className="badge badge-primary gap-2">
                  Search: {globalFilter}
                  <button
                    onClick={() => setGlobalFilter("")}
                    className="hover:text-primary-content/80"
                  >
                    ×
                  </button>
                </div>
              )}
              {statusFilter !== "all" && (
                <div className="badge badge-secondary gap-2">
                  Status: <span className="capitalize">{statusFilter}</span>
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="hover:text-secondary-content/80"
                  >
                    ×
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setGlobalFilter("");
                  setStatusFilter("all");
                }}
                className="text-xs link link-error"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="table">
              <thead className="bg-base-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-base-content font-semibold"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="hover:bg-base-200/50 transition-colors"
                      style={{
                        animation: `fadeIn 0.3s ease-in-out ${
                          index * 0.05
                        }s both`,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <FaUserPlus className="text-5xl text-base-content/20" />
                        <div>
                          <p className="text-lg font-semibold text-base-content/60">
                            No admissions found
                          </p>
                          <p className="text-sm text-base-content/40">
                            Try adjusting your filters or search query
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Accordion View */}
          <div className="md:hidden">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => {
                const admission = row.original;
                const isExpanded = mobileExpandedRows.has(admission._id);
                const status = admission.status?.toLowerCase();

                return (
                  <div
                    key={admission._id}
                    className="border-b border-base-300 last:border-b-0 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Collapsed Row */}
                    <div
                      className="p-4 hover:bg-base-200 transition-colors cursor-pointer"
                      onClick={() => toggleMobileRowExpansion(admission._id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: Student Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-10 h-10 bg-linear-to-br ${
                              status === "enrolled"
                                ? "from-success to-primary"
                                : status === "follow-up"
                                ? "from-warning to-orange-500"
                                : status === "inquiry"
                                ? "from-info to-primary"
                                : "from-error to-red-600"
                            } rounded-xl flex items-center justify-center shadow-sm shrink-0`}
                          >
                            <FaUserPlus className="text-white text-lg" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base-content truncate">
                              {admission.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`badge badge-sm ${
                                  status === "inquiry"
                                    ? "badge-info"
                                    : status === "follow-up"
                                    ? "badge-warning"
                                    : status === "enrolled"
                                    ? "badge-success"
                                    : "badge-error"
                                }`}
                              >
                                {status === "inquiry" ? (
                                  <FaClock className="text-xs mr-1" />
                                ) : status === "follow-up" ? (
                                  <BiSolidPhoneCall className="text-xs mr-1" />
                                ) : status === "enrolled" ? (
                                  <FaUserCheck className="text-xs mr-1" />
                                ) : (
                                  <FaBan className="text-xs mr-1" />
                                )}
                                <span className="capitalize">
                                  {status || "Unknown"}
                                </span>
                              </span>
                              {admission.followUps &&
                                admission.followUps.length > 0 && (
                                  <span className="text-xs text-base-content/60 flex items-center gap-1">
                                    <FaCommentDots className="text-xs" />
                                    {admission.followUps.length}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Expand Icon */}
                        <div className="shrink-0">
                          {isExpanded ? (
                            <MdExpandLess className="text-2xl text-base-content/60" />
                          ) : (
                            <MdExpandMore className="text-2xl text-base-content/60" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-base-200/50 space-y-3">
                        {/* Phone */}
                        <div className="flex items-center gap-2 text-sm">
                          <MdPhone className="text-primary shrink-0" />
                          <span className="text-base-content/70">
                            {admission.phone}
                          </span>
                        </div>

                        {/* Email */}
                        {admission.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <MdEmail className="text-primary shrink-0" />
                            <span className="text-base-content/70 truncate">
                              {admission.email}
                            </span>
                          </div>
                        )}

                        {/* Interested Batch */}
                        {admission.interestedBatchId && (
                          <div className="flex items-center gap-2 text-sm">
                            <MdSchool className="text-primary shrink-0" />
                            <span className="text-base-content/70">
                              {getBatchInfo(admission.interestedBatchId)}
                            </span>
                          </div>
                        )}

                        {/* Created Date */}
                        {admission.createdAt && (
                          <div className="flex items-center gap-2 text-sm">
                            <MdCalendarToday className="text-primary shrink-0" />
                            <span className="text-base-content/70">
                              {new Date(admission.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFollowUpClick(admission)}
                              className="btn btn-sm btn-warning text-white flex-1"
                              title="View Follow-ups"
                            >
                              <BiSolidPhoneCall className="text-lg" />
                              Follow-up
                            </button>
                            <button
                              onClick={() => handleDeleteClick(admission)}
                              className="btn btn-sm btn-error text-white flex-1"
                              title="Delete"
                            >
                              <MdDelete className="text-lg" />
                              Delete
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleMarkAsEnrolled(admission)}
                              className="btn btn-sm btn-success text-white flex-1"
                              title="Mark as Enrolled"
                              disabled={
                                admission.status?.toLowerCase() === "enrolled"
                              }
                            >
                              <FaUserCheck className="text-lg" />
                              Enrolled
                            </button>
                            <button
                              onClick={() => handleMarkAsRejected(admission)}
                              className="btn btn-sm btn-error text-white flex-1"
                              title="Mark as Rejected"
                              disabled={
                                admission.status?.toLowerCase() === "rejected"
                              }
                            >
                              <FaBan className="text-lg" />
                              Rejected
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <FaUserPlus className="text-5xl text-base-content/20" />
                  <div>
                    <p className="text-lg font-semibold text-base-content/60">
                      No admissions found
                    </p>
                    <p className="text-sm text-base-content/40">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {table.getRowModel().rows.length > 0 && (
            <div className="border-t border-base-300 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-base-content/70">
                  Showing{" "}
                  <span className="font-semibold text-base-content">
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-base-content">
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-base-content">
                    {table.getFilteredRowModel().rows.length}
                  </span>{" "}
                  results
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="btn btn-sm btn-outline btn-primary disabled:opacity-50"
                  >
                    <MdNavigateBefore className="text-lg" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {(() => {
                      const currentPage = table.getState().pagination.pageIndex;
                      const pageCount = table.getPageCount();
                      const pages = [];

                      for (let i = 0; i < pageCount; i++) {
                        if (
                          i === 0 ||
                          i === pageCount - 1 ||
                          Math.abs(i - currentPage) <= 1
                        ) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => table.setPageIndex(i)}
                              className={`btn btn-sm ${
                                currentPage === i ? "btn-primary" : "btn-ghost"
                              }`}
                            >
                              {i + 1}
                            </button>
                          );
                        } else if (Math.abs(i - currentPage) === 2) {
                          pages.push(
                            <span key={i} className="px-2">
                              ...
                            </span>
                          );
                        }
                      }

                      return pages;
                    })()}
                  </div>

                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="btn btn-sm btn-outline btn-primary disabled:opacity-50"
                  >
                    Next
                    <MdNavigateNext className="text-lg" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-base-content/70">
                    Rows per page:
                  </span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="select select-sm select-bordered bg-base-200"
                  >
                    {[5, 10, 20, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Modal */}
      {followUpModalOpen && selectedAdmission && (
        <div className="modal modal-open fixed inset-0 z-9999 flex items-center justify-center">
          <div className="modal-box relative z-10000 max-w-3xl">
            <button
              onClick={handleCloseFollowUpModal}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <MdClose className="text-lg" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <BiSolidPhoneCall className="text-warning text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-base-content">
                  Follow-up History
                </h3>
                <p className="text-sm text-base-content/60">
                  All follow-ups for {selectedAdmission.name}
                </p>
              </div>
            </div>

            {/* Student Info Card */}
            <div className="bg-base-200 rounded-xl p-4 border border-base-300 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center shrink-0">
                  <FaUserPlus className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-base-content">
                    {selectedAdmission.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MdPhone className="text-primary" />
                      <span className="text-base-content/80">
                        {selectedAdmission.phone}
                      </span>
                    </div>
                    {selectedAdmission.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <MdEmail className="text-primary" />
                        <span className="text-base-content/80 truncate">
                          {selectedAdmission.email}
                        </span>
                      </div>
                    )}
                    {selectedAdmission.interestedBatchId && (
                      <div className="flex items-center gap-2 text-sm">
                        <MdSchool className="text-primary" />
                        <span className="badge badge-primary badge-sm">
                          {getBatchInfo(selectedAdmission.interestedBatchId)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`badge badge-sm ${
                          selectedAdmission.status?.toLowerCase() === "inquiry"
                            ? "badge-info"
                            : selectedAdmission.status?.toLowerCase() ===
                              "follow-up"
                            ? "badge-warning"
                            : selectedAdmission.status?.toLowerCase() ===
                              "enrolled"
                            ? "badge-success"
                            : "badge-error"
                        }`}
                      >
                        {selectedAdmission.status?.toLowerCase() ===
                        "inquiry" ? (
                          <FaClock className="text-xs mr-1" />
                        ) : selectedAdmission.status?.toLowerCase() ===
                          "follow-up" ? (
                          <BiSolidPhoneCall className="text-xs mr-1" />
                        ) : selectedAdmission.status?.toLowerCase() ===
                          "enrolled" ? (
                          <FaUserCheck className="text-xs mr-1" />
                        ) : (
                          <FaBan className="text-xs mr-1" />
                        )}
                        <span className="capitalize">
                          {selectedAdmission.status || "Unknown"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-ups List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedAdmission.followUps &&
              selectedAdmission.followUps.length > 0 ? (
                selectedAdmission.followUps.map((followUp, index) => (
                  <div
                    key={index}
                    className="bg-base-100 border border-base-300 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center shrink-0">
                        <FaCommentDots className="text-warning text-lg" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-base-content">
                            Follow-up #{index + 1}
                          </span>
                          {followUp.date && (
                            <div className="flex items-center gap-1 text-xs text-base-content/60">
                              <MdCalendarToday className="text-sm" />
                              {new Date(followUp.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          )}
                        </div>
                        {followUp.note && (
                          <p className="text-sm text-base-content/80 leading-relaxed">
                            {followUp.note}
                          </p>
                        )}
                        {followUp.nextFollowUpDate && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-base-content/60">
                              Next follow-up:
                            </span>
                            <span className="badge badge-sm badge-warning gap-1">
                              <MdCalendarToday className="text-xs" />
                              {new Date(
                                followUp.nextFollowUpDate
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center">
                      <FaCommentDots className="text-4xl text-base-content/20" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-base-content/60">
                        No follow-ups yet
                      </p>
                      <p className="text-sm text-base-content/40">
                        No follow-up history available for this admission
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-action">
              <button
                onClick={handleCloseFollowUpModal}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-9998"
            onClick={handleCloseFollowUpModal}
          ></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal modal-open fixed inset-0 z-9999 flex items-center justify-center">
          <div className="modal-box relative z-10000">
            <button
              onClick={handleCancelDelete}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <MdClose className="text-lg" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
                <MdWarning className="text-error text-2xl" />
              </div>
              <h3 className="font-bold text-lg text-base-content">
                Delete Admission
              </h3>
            </div>

            <div className="py-4">
              <p className="text-base-content/80 mb-4">
                Are you sure you want to delete this admission record? This
                action cannot be undone.
              </p>

              {admissionToDelete && (
                <div className="bg-base-200 rounded-xl p-4 border border-base-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <FaUserPlus className="text-primary text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-base-content">
                        {admissionToDelete.name}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {admissionToDelete.phone}
                      </p>
                      {admissionToDelete.email && (
                        <p className="text-xs text-base-content/60">
                          {admissionToDelete.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="alert alert-warning mt-4">
                <MdWarning className="text-lg" />
                <div>
                  <h4 className="font-semibold text-sm">Warning</h4>
                  <p className="text-xs">
                    Deleting this admission will permanently remove all inquiry
                    and follow-up records from the system.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={handleCancelDelete}
                className="btn btn-ghost"
                disabled={deleteAdmissionMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteAdmissionMutation.isPending}
                className="btn btn-error text-white"
              >
                {deleteAdmissionMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <MdDelete />
                    Delete Admission
                  </>
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-9998"
            onClick={handleCancelDelete}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Admissions;
