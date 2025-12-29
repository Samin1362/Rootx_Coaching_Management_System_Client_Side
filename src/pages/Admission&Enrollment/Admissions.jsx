import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  MdVisibility,
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

const Admissions = () => {
  const axiosSecure = useAxiosSecure();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ["admissions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admissions");
      return res.data;
    },
  });

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
          <div className="flex items-center gap-3 min-w-[200px]">
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
          <div className="flex items-center gap-2">
            <MdSchool className="text-base-content/40" />
            <span className="badge badge-outline badge-primary font-medium">
              {getValue() || "N/A"}
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
              className={`badge gap-2 font-medium ${
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
        cell: () => (
          <div className="flex items-center gap-1">
            <button
              className="btn btn-ghost btn-sm btn-square text-info hover:bg-info/10"
              title="View Details"
            >
              <MdVisibility className="text-lg" />
            </button>
            <button
              className="btn btn-ghost btn-sm btn-square text-warning hover:bg-warning/10"
              title="Add Follow-up"
            >
              <BiSolidPhoneCall className="text-lg" />
            </button>
            <button
              className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
              title="Delete"
            >
              <MdDelete className="text-lg" />
            </button>
          </div>
        ),
      },
    ],
    []
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/60">Loading admissions...</p>
        </div>
      </div>
    );
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
                Admissions
              </h1>
              <p className="text-sm text-base-content/60">
                Manage prospective student inquiries and enrollments
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
                Total
              </div>
            </div>
            <div className="bg-info/10 rounded-xl p-3 border border-info/20 shadow-sm">
              <div className="text-2xl font-bold text-info">
                {stats.inquiry}
              </div>
              <div className="text-xs text-info/80 flex items-center gap-1">
                <FaClock className="text-sm" />
                Inquiry
              </div>
            </div>
            <div className="bg-warning/10 rounded-xl p-3 border border-warning/20 shadow-sm">
              <div className="text-2xl font-bold text-warning">
                {stats.followUp}
              </div>
              <div className="text-xs text-warning/80 flex items-center gap-1">
                <BiSolidPhoneCall className="text-sm" />
                Follow-up
              </div>
            </div>
            <div className="bg-success/10 rounded-xl p-3 border border-success/20 shadow-sm">
              <div className="text-2xl font-bold text-success">
                {stats.enrolled}
              </div>
              <div className="text-xs text-success/80 flex items-center gap-1">
                <FaUserCheck className="text-sm" />
                Enrolled
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
                  placeholder="Search by name, email, or phone..."
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
                className="select select-bordered bg-base-200 focus:bg-base-100 min-w-[160px]"
              >
                <option value="all">All Status</option>
                <option value="inquiry">Inquiry</option>
                <option value="follow-up">Follow-up</option>
                <option value="enrolled">Enrolled</option>
                <option value="rejected">Rejected</option>
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
          <div className="overflow-x-auto">
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
    </div>
  );
};

export default Admissions;
