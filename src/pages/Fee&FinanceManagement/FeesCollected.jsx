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
  MdSearch,
  MdNavigateNext,
  MdNavigateBefore,
  MdPerson,
  MdCalendarToday,
  MdExpandMore,
  MdExpandLess,
  MdSchool,
  MdPayment,
} from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaUsers,
  FaMoneyCheck,
  FaHistory,
} from "react-icons/fa";
import { BiSolidBank } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Loader from "../../components/Loader";

const FeesCollected = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [mobileExpandedRows, setMobileExpandedRows] = useState(new Set());

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

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["fees-collected"],
    queryFn: async () => {
      const res = await axiosSecure.get("/fees?status=clear");
      return res.data.data || [];
    },
  });

  // Fetch students and batches for display
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data.data || [];
    },
  });

  const { data: batches = [] } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data.data || [];
    },
  });

  // Helper functions
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

  // Toggle row expansion
  const toggleRowExpansion = (feeId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [feeId]: !prev[feeId],
    }));
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCollected = fees.reduce(
      (sum, fee) => sum + (fee.paidAmount || 0),
      0
    );
    const totalRecords = fees.length;
    const totalPayments = fees.reduce(
      (sum, fee) => sum + (fee.payments?.length || 0),
      0
    );

    return { totalCollected, totalRecords, totalPayments };
  }, [fees]);

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        id: "expander",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={() => toggleRowExpansion(row.original._id)}
            className="btn btn-xs btn-ghost btn-square"
          >
            {expandedRows[row.original._id] ? (
              <MdExpandLess className="text-lg" />
            ) : (
              <MdExpandMore className="text-lg" />
            )}
          </button>
        ),
      },
      {
        accessorKey: "studentId",
        header: "Student",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <MdPerson className="text-primary text-lg" />
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
        accessorKey: "fees",
        header: "Fees",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
              <TbCurrencyTaka className="text-info text-lg" />
            </div>
            <span className="font-semibold text-base-content">
              ৳{getValue()?.toLocaleString() || "0"}
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
              ৳{getValue()?.toLocaleString() || "0"}
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
        cell: () => (
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-success" />
            <span className="badge badge-success badge-sm">Cleared</span>
          </div>
        ),
      },
      {
        accessorKey: "lastPaymentDate",
        header: "Last Payment",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <MdCalendarToday className="text-xs" />
            {getValue()
              ? new Date(getValue()).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </div>
        ),
      },
    ],
    [getStudentName, getStudentPhone, getBatchName, expandedRows]
  );

  const table = useReactTable({
    data: fees,
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
    return <Loader message="Loading collected fees..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-base-200 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-success to-primary rounded-xl flex items-center justify-center shadow-lg">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              Fees Collected
            </h1>
            <p className="text-base-content/60 mt-2 ml-15">
              View all cleared fee records and payment history
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-success">
              <FaMoneyCheck className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Collected</div>
            <div className="stat-value text-2xl text-success">
              ৳{stats.totalCollected.toLocaleString()}
            </div>
            <div className="stat-desc text-xs">
              {stats.totalRecords} cleared records
            </div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-primary">
              <FaCheckCircle className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Cleared Records</div>
            <div className="stat-value text-2xl text-primary">
              {stats.totalRecords}
            </div>
            <div className="stat-desc text-xs">Fully paid fees</div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-info">
              <FaHistory className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Payments</div>
            <div className="stat-value text-2xl text-info">
              {stats.totalPayments}
            </div>
            <div className="stat-desc text-xs">Payment transactions</div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
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
                      <FaCheckCircle className="text-5xl text-base-content/20" />
                      <p className="text-lg font-semibold">
                        No collected fees found
                      </p>
                      <p className="text-sm">
                        {globalFilter
                          ? "Try adjusting your search"
                          : "Cleared fee records will appear here"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <>
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
                    {/* Expanded Payment History Row */}
                    {expandedRows[row.original._id] && (
                      <tr className="bg-base-200/30">
                        <td colSpan={columns.length} className="p-6">
                          <div className="bg-base-100 rounded-xl p-4 border border-base-300">
                            <h4 className="text-sm font-semibold text-base-content mb-4 flex items-center gap-2">
                              <FaHistory className="text-primary" />
                              Payment History
                            </h4>
                            {row.original.payments &&
                            row.original.payments.length > 0 ? (
                              <div className="space-y-2">
                                {row.original.payments.map((payment, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                                        {payment.method === "cash" ? (
                                          <FaMoneyBillWave className="text-success text-sm" />
                                        ) : (
                                          <BiSolidBank className="text-info text-sm" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-base-content">
                                          ৳{payment.amount?.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-base-content/60">
                                          {payment.method === "cash"
                                            ? "Cash"
                                            : "Online"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-xs text-base-content/60">
                                      {new Date(payment.date).toLocaleDateString(
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
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-base-content/60 text-center py-4">
                                No payment history available
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
                <FaCheckCircle className="text-5xl text-base-content/20" />
                <p className="text-lg font-semibold">No collected fees found</p>
                <p className="text-sm">
                  {globalFilter
                    ? "Try adjusting your search"
                    : "Cleared fee records will appear here"}
                </p>
              </div>
            </div>
          ) : (
            table.getRowModel().rows.map((row, index) => {
              const fee = row.original;
              const isExpanded = mobileExpandedRows.has(row.id);
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
                    onClick={() => toggleMobileRowExpansion(row.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Student Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-linear-to-br from-success to-primary rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <MdPerson className="text-white text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base-content truncate">
                            {studentInfo?.name || "Unknown Student"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="badge badge-success badge-sm">
                              Cleared
                            </span>
                            <span className="text-xs text-base-content/60">
                              ৳{fee.paidAmount?.toLocaleString()}
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

                      {/* Fees */}
                      <div className="flex items-center gap-2 text-sm">
                        <TbCurrencyTaka className="text-primary text-lg shrink-0" />
                        <span className="text-base-content/70">
                          Total: ৳{fee.fees?.toLocaleString()}
                        </span>
                      </div>

                      {/* Paid Amount */}
                      <div className="flex items-center gap-2 text-sm">
                        <FaCheckCircle className="text-success shrink-0" />
                        <span className="text-base-content/70">
                          Paid: ৳{fee.paidAmount?.toLocaleString()}
                        </span>
                      </div>

                      {/* Payment Method */}
                      {fee.paymentMethod && (
                        <div className="flex items-center gap-2 text-sm">
                          <MdPayment className="text-primary shrink-0" />
                          <span className="text-base-content/70 capitalize">
                            {fee.paymentMethod}
                          </span>
                        </div>
                      )}

                      {/* Last Payment Date */}
                      {fee.lastPaymentDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <MdCalendarToday className="text-primary shrink-0" />
                          <span className="text-base-content/70">
                            {new Date(fee.lastPaymentDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Payment History */}
                      {fee.payments && fee.payments.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-base-300">
                          <h4 className="text-sm font-semibold text-base-content mb-2 flex items-center gap-2">
                            <FaHistory className="text-primary" />
                            Payment History
                          </h4>
                          <div className="space-y-2">
                            {fee.payments.map((payment, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-base-100 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-success/10 rounded-lg flex items-center justify-center shrink-0">
                                    {payment.method === "cash" ? (
                                      <FaMoneyBillWave className="text-success text-xs" />
                                    ) : (
                                      <BiSolidBank className="text-info text-xs" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-base-content">
                                      ${payment.amount?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-base-content/60">
                                      {payment.method === "cash"
                                        ? "Cash"
                                        : "Online"}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-xs text-base-content/60">
                                  {new Date(payment.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
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
                  fees.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-base-content">
                {fees.length}
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

export default FeesCollected;
