import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  MdSearch,
  MdNavigateNext,
  MdNavigateBefore,
  MdFilterList,
  MdPerson,
  MdAttachMoney,
  MdCalendarToday,
  MdPayment,
  MdPersonAdd,
  MdExpandMore,
  MdExpandLess,
  MdSchool,
} from "react-icons/md";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaMoneyCheck,
} from "react-icons/fa";
import { BiSolidBank } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Loader from "../../components/Loader";

const Finances = () => {
  const axiosSecure = useAxiosSecure();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Toggle row expansion for mobile
  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const res = await axiosSecure.get("/fees");
      return res.data;
    },
  });

  // Fetch students and batches for display
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data;
    },
  });

  const { data: batches = [] } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data;
    },
  });

  // Helper functions to get student and batch names
  const getStudentName = useCallback(
    (studentId) => {
      const student = students.find((s) => s._id === studentId);
      return student?.name || "Unknown Student";
    },
    [students]
  );

  const getStudentPhone = useCallback(
    (studentId) => {
      const student = students.find((s) => s._id === studentId);
      return student?.phone || "N/A";
    },
    [students]
  );

  const getStudentRoll = useCallback(
    (studentId) => {
      const student = students.find((s) => s._id === studentId);
      return student?.roll || "N/A";
    },
    [students]
  );

  const getStudentImage = useCallback(
    (studentId) => {
      const student = students.find((s) => s._id === studentId);
      return (
        student?.image ||
        "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
      );
    },
    [students]
  );

  const getBatchName = useCallback(
    (batchId) => {
      const batch = batches.find((b) => b._id === batchId);
      return batch?.name || "Unknown Batch";
    },
    [batches]
  );

  // Helper functions for mobile accordion view
  const getStudentInfo = useCallback(
    (studentId) => {
      return students.find((s) => s._id === studentId);
    },
    [students]
  );

  const getBatchInfo = useCallback(
    (batchId) => {
      return batches.find((b) => b._id === batchId);
    },
    [batches]
  );

  // Filter fees based on status
  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const matchesStatus =
        statusFilter === "all" ||
        fee.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesStatus;
    });
  }, [fees, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalFees = fees.reduce((sum, fee) => sum + (fee.totalFee || 0), 0);
    const totalPaid = fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    const totalDue = fees.reduce((sum, fee) => sum + (fee.dueAmount || 0), 0);
    const clearCount = fees.filter((f) => f.status === "clear").length;
    const dueCount = fees.filter((f) => f.status === "due").length;

    return { totalFees, totalPaid, totalDue, clearCount, dueCount };
  }, [fees]);

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        accessorKey: "studentId",
        header: "Student",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="avatar shrink-0">
              <div className="w-10 h-10 rounded-lg ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={getStudentImage(row.original.studentId)}
                  alt={getStudentName(row.original.studentId)}
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-primary badge-xs font-bold">
                  #{getStudentRoll(row.original.studentId)}
                </span>
                <span className="font-semibold text-base-content">
                  {getStudentName(row.original.studentId)}
                </span>
              </div>
              <div className="text-xs text-base-content/60 flex items-center gap-1">
                📞 {getStudentPhone(row.original.studentId)}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "batchId",
        header: "Batch",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <FaUsers className="text-secondary text-sm" />
            </div>
            <span className="font-medium text-base-content">
              {getBatchName(row.original.batchId)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "totalFee",
        header: "Total Fee",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
              <MdAttachMoney className="text-info text-sm" />
            </div>
            <span className="font-semibold text-base-content">
              ${getValue()?.toLocaleString() || "0"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "paidAmount",
        header: "Paid Amount",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <FaMoneyCheck className="text-success text-sm" />
            </div>
            <span className="font-semibold text-success">
              ${getValue()?.toLocaleString() || "0"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "dueAmount",
        header: "Due Amount",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <FaClock className="text-warning text-sm" />
            </div>
            <span className="font-semibold text-warning">
              ${getValue()?.toLocaleString() || "0"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            {getValue() === "cash" ? (
              <>
                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <FaMoneyBillWave className="text-success text-sm" />
                </div>
                <span className="badge badge-success badge-sm">Cash</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
                  <BiSolidBank className="text-info text-sm" />
                </div>
                <span className="badge badge-info badge-sm">Online</span>
              </>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <div className="flex items-center gap-2">
              {status === "clear" ? (
                <>
                  <FaCheckCircle className="text-success" />
                  <span className="badge badge-success badge-sm">Clear</span>
                </>
              ) : (
                <>
                  <FaClock className="text-warning" />
                  <span className="badge badge-warning badge-sm">Due</span>
                </>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <MdCalendarToday className="text-xs" />
            {new Date(getValue()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        ),
      },
    ],
    [getStudentName, getStudentPhone, getStudentImage, getBatchName]
  );

  // TanStack Table returns functions that cannot be safely memoized
  // This is expected behavior and does not affect functionality
  const table = useReactTable({
    data: filteredFees,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return <Loader message="Loading fee records..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-base-200 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <FaMoneyBillWave className="text-white text-xl" />
              </div>
              Fee Management
            </h1>
            <p className="text-base-content/60 mt-2 ml-15">
              Track and manage all student fee records
            </p>
          </div>
          <Link
            to="/dashboard/financeManagement/newFeeEntry"
            className="btn btn-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <MdPersonAdd className="text-lg" />
            New Fee Entry
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-primary">
              <MdAttachMoney className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Fees</div>
            <div className="stat-value text-2xl text-primary">
              ${stats.totalFees.toLocaleString()}
            </div>
            <div className="stat-desc text-xs">{fees.length} entries</div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-success">
              <FaMoneyCheck className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Paid</div>
            <div className="stat-value text-2xl text-success">
              ${stats.totalPaid.toLocaleString()}
            </div>
            <div className="stat-desc text-xs">{stats.clearCount} cleared</div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-warning">
              <FaClock className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Due</div>
            <div className="stat-value text-2xl text-warning">
              ${stats.totalDue.toLocaleString()}
            </div>
            <div className="stat-desc text-xs">{stats.dueCount} pending</div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-info">
              <MdPayment className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Collection Rate</div>
            <div className="stat-value text-2xl text-info">
              {stats.totalFees > 0
                ? Math.round((stats.totalPaid / stats.totalFees) * 100)
                : 0}
              %
            </div>
            <div className="stat-desc text-xs">Payment efficiency</div>
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
              <input
                type="text"
                placeholder="Search by student name, batch, or amount..."
                className="input input-bordered w-full pl-12 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <MdFilterList className="text-base-content/60 text-xl" />
            <select
              className="select select-bordered bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="clear">Clear</option>
              <option value="due">Due</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="table table-zebra">
            <thead className="bg-base-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-base-content font-semibold text-sm cursor-pointer hover:bg-base-300 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <span className="text-primary">
                            {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-12 text-base-content/60"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <FaMoneyBillWave className="text-5xl text-base-content/20" />
                      <p className="text-lg font-semibold">
                        No fee records found
                      </p>
                      <p className="text-sm">
                        {globalFilter || statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Start by creating a new fee entry"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-base-200/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Accordion View */}
        <div className="md:hidden">
          {table.getRowModel().rows.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <div className="flex flex-col items-center gap-3">
                <FaMoneyBillWave className="text-5xl text-base-content/20" />
                <p className="text-lg font-semibold">No fee records found</p>
                <p className="text-sm">
                  {globalFilter || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Start by creating a new fee entry"}
                </p>
              </div>
            </div>
          ) : (
            table.getRowModel().rows.map((row, index) => {
              const fee = row.original;
              const isExpanded = expandedRows.has(row.id);
              const studentInfo = getStudentInfo(fee.studentId);
              const batchInfo = getBatchInfo(fee.batchId);

              return (
                <div
                  key={row.id}
                  className="border-b border-base-300 last:border-b-0 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Collapsed Row */}
                  <div
                    className="p-4 hover:bg-base-200 transition-colors cursor-pointer"
                    onClick={() => toggleRowExpansion(row.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Student Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="avatar shrink-0">
                          <div className="w-10 h-10 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img
                              src={
                                studentInfo?.image ||
                                "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
                              }
                              alt={studentInfo?.name || "Student"}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base-content truncate">
                            {studentInfo?.name || "Unknown Student"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`badge badge-sm ${
                                fee.status?.toLowerCase() === "clear"
                                  ? "badge-success"
                                  : "badge-warning"
                              }`}
                            >
                              {fee.status === "clear" ? "Paid" : "Due"}
                            </span>
                            <span className="text-xs text-base-content/60">
                              ${fee.totalFee}
                            </span>
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
                      {/* Batch Info */}
                      {batchInfo && (
                        <div className="flex items-center gap-2 text-sm">
                          <MdSchool className="text-primary shrink-0" />
                          <span className="text-base-content/70">
                            {batchInfo.name}
                          </span>
                        </div>
                      )}

                      {/* Total Fee */}
                      <div className="flex items-center gap-2 text-sm">
                        <MdAttachMoney className="text-primary shrink-0" />
                        <span className="text-base-content/70">
                          Total: ${fee.totalFee?.toLocaleString()}
                        </span>
                      </div>

                      {/* Paid Amount */}
                      <div className="flex items-center gap-2 text-sm">
                        <FaCheckCircle className="text-success shrink-0" />
                        <span className="text-base-content/70">
                          Paid: ${fee.paidAmount?.toLocaleString()}
                        </span>
                      </div>

                      {/* Due Amount */}
                      {fee.dueAmount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <FaClock className="text-warning shrink-0" />
                          <span className="text-base-content/70">
                            Due: ${fee.dueAmount?.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Payment Method */}
                      {fee.paymentMethod && (
                        <div className="flex items-center gap-2 text-sm">
                          <MdPayment className="text-primary shrink-0" />
                          <span className="text-base-content/70 capitalize">
                            {fee.paymentMethod}
                          </span>
                        </div>
                      )}

                      {/* Date */}
                      {fee.createdAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <MdCalendarToday className="text-primary shrink-0" />
                          <span className="text-base-content/70">
                            {new Date(fee.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {table.getRowModel().rows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-base-300 bg-base-200/50">
            <div className="text-sm text-base-content/60">
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
                  filteredFees.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-base-content">
                {filteredFees.length}
              </span>{" "}
              entries
            </div>

            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <MdNavigateBefore className="text-lg" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: table.getPageCount() },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`btn btn-sm ${
                      table.getState().pagination.pageIndex === pageNum - 1
                        ? "btn-primary"
                        : "btn-ghost"
                    }`}
                    onClick={() => table.setPageIndex(pageNum - 1)}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                className="btn btn-sm btn-outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <MdNavigateNext className="text-lg" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finances;
