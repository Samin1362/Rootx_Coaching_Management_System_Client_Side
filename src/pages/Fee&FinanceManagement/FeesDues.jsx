import { useState, useMemo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
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
  MdPayment,
  MdClose,
  MdSchool,
} from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import {
  FaMoneyBillWave,
  FaClock,
  FaUsers,
  FaMoneyCheck,
  FaHistory,
  FaExclamationTriangle,
} from "react-icons/fa";
import { BiSolidBank } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";

const FeesDues = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const notification = useNotification();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [mobileExpandedRows, setMobileExpandedRows] = useState(new Set());
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    feeId: null,
    feeData: null,
  });
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

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
    queryKey: ["fees"], // Changed key to match Finances for caching potential
    queryFn: async () => {
      const res = await axiosSecure.get("/fees");
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

  // Calculate statistics and Student Dues (Logic reused from Finances.jsx)
  const { stats: financeStats, studentDues } = useMemo(() => {
    // 1. Map Batch Fees
    const batchFees = {};
    batches.forEach((b) => {
      batchFees[b._id] = b.fees || 0;
    });

    // 2. Map Student Payments
    const studentPayments = {};
    fees.forEach((f) => {
      const paid = Number(f.paidAmount) || 0;
      const sId = f.studentId;
      if (sId) {
        studentPayments[sId] = (studentPayments[sId] || 0) + paid;
      }
    });

    let totalExpectedFees = 0;
    let totalPaid = 0;
    let totalDue = 0;

    const duesMap = {};

    students.forEach((student) => {
      if (student.batchId) {
        const expected = batchFees[student.batchId] || 0;
        const paid = studentPayments[student._id] || 0;
        const due = Math.max(0, expected - paid);
        
        duesMap[student._id] = due;

        totalExpectedFees += expected;
        totalPaid += paid;
        totalDue += due;
      }
    });

    const grandTotalPaid = fees.reduce((sum, f) => sum + (Number(f.paidAmount) || 0), 0);
    
    // In FeesDues, "Total Due" statistic should probably reflect the *sum of student dues*, not just the sum of dueAmount on filtered rows.
    // But let's keep it consistent: Total Due = Sum of (Expected - Paid) for all students.
    
    return {
        stats: {
             totalDue,
             totalFees: totalExpectedFees,
             totalPaid: grandTotalPaid,
             totalRecords: fees.length 
        },
        studentDues: duesMap
    };
  }, [fees, students, batches]);

  // Filter for rows that are actually "Due" or "Partial"
  // If we only stick to the API's "status=due", we might miss some.
  // But to be consistent with the page "Fees Due", we usually want to see entries that need payment.
  // Converting the logic: We want to show rows for students who have > 0 dues?
  // OR we specifically want to show the 'fee entries' that are marked as 'due'?
  // Previous logic was: `fees` fetched with `?status=due`.
  // Let's filter `fees` by `status === 'due'` OR maybe using the calculated due?
  // Usually this page lists Pending Transactions/Installments.
  // Let's stick to `status === 'due'`.
  
  const dueFees = useMemo(() => {
    return fees.filter(f => f.status === 'due' || f.dueAmount > 0);
  }, [fees]);

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async ({ feeId, amount, method }) => {
      const res = await axiosSecure.patch(`/fees/${feeId}`, {
        amount,
        paymentMethod: method,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["fees-dues"]);
      queryClient.invalidateQueries(["fees"]);
      queryClient.invalidateQueries(["fees-collected"]);
      notification.success(
        `Payment added successfully! ${
          data.updatedStatus === "clear"
            ? "Fee fully cleared!"
            : `Remaining due: ৳${data.dueAmount}`
        }`,
        "Payment Success"
      );
      handleCloseModal();
    },
    onError: (error) => {
      notification.error(
        error.response?.data?.message || "Failed to add payment",
        "Error"
      );
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

  // Open payment modal
  const handleOpenPaymentModal = (fee) => {
    setPaymentModal({
      isOpen: true,
      feeId: fee._id,
      feeData: fee,
    });
    setPaymentAmount("");
    setPaymentMethod("cash");
  };

  // Close payment modal
  const handleCloseModal = () => {
    setPaymentModal({
      isOpen: false,
      feeId: null,
      feeData: null,
    });
    setPaymentAmount("");
    setPaymentMethod("cash");
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (paymentModal.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [paymentModal.isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && paymentModal.isOpen && !paymentMutation.isPending) {
        handleCloseModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [paymentModal.isOpen, paymentMutation.isPending]);

  // Handle payment submission
  const handleSubmitPayment = (e) => {
    e.preventDefault();

    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      notification.warning(
        "Please enter a valid payment amount",
        "Invalid Amount"
      );
      return;
    }

    if (amount > paymentModal.feeData.dueAmount) {
      notification.warning(
        "Payment amount cannot exceed due amount",
        "Invalid Amount"
      );
      return;
    }

    paymentMutation.mutate({
      feeId: paymentModal.feeId,
      amount,
      method: paymentMethod,
    });
  };

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
        accessorKey: "dueAmount",
        header: "Due Amount",
        cell: ({ row }) => {
            const due = Number(row.original.dueAmount) || 0;
            return (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center">
                  <FaExclamationTriangle className="text-error text-sm" />
                </div>
                <span className="font-semibold text-error">
                  ৳{due.toLocaleString()}
                </span>
              </div>
            );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: () => (
          <div className="flex items-center gap-2">
            <FaClock className="text-warning" />
            <span className="badge badge-warning badge-sm">Due</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => handleOpenPaymentModal(row.original)}
            className="btn btn-sm btn-primary text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <MdPayment className="text-lg" />
            Add Payment
          </button>
        ),
      },
    ],
    [getStudentName, getStudentPhone, getStudentRoll, getBatchName, expandedRows]
  );

  const table = useReactTable({
    data: dueFees,
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
    return <Loader message="Loading due fees..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-base-200 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-warning to-error rounded-xl flex items-center justify-center shadow-lg">
                <FaClock className="text-white text-xl" />
              </div>
              Fees Due
            </h1>
            <p className="text-base-content/60 mt-2 ml-15">
              Manage pending fee payments and add new payments
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-error">
              <FaExclamationTriangle className="text-3xl" />
            </div>
            <div className="stat-title text-xs font-medium text-base-content/60">
              Total Due
            </div>
            <div className="stat-value text-2xl text-error mt-1">
              ৳{financeStats.totalDue.toLocaleString()}
            </div>
            <div className="stat-desc text-xs mt-1">
              From {financeStats.totalRecords} records
            </div>
          </div>
          <div className="hidden lg:block w-px h-12 bg-base-300"></div>
          <div>
            <div className="stat-title text-xs font-medium text-base-content/60">
              Total Fees
            </div>
            <div className="stat-value text-2xl text-base-content mt-1">
              ৳{financeStats.totalFees.toLocaleString()}
            </div>
          </div>
          <div className="hidden lg:block w-px h-12 bg-base-300"></div>
          <div>
            <div className="stat-title text-xs font-medium text-base-content/60">
              Total Paid
            </div>
            <div className="stat-value text-2xl text-success mt-1">
              ৳{financeStats.totalPaid.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-warning">
              <FaClock className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Pending Records</div>
            <div className="stat-value text-2xl text-warning">
              {financeStats.totalRecords}
            </div>
            <div className="stat-desc text-xs">Awaiting payment</div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-success">
              <FaMoneyCheck className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Partial Payments</div>
            <div className="stat-value text-2xl text-success">
              ৳{financeStats.totalPaid.toLocaleString()}
            </div>
            <div className="stat-desc text-xs">Already collected</div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-info">
              <TbCurrencyTaka className="text-4xl" />
            </div>
            <div className="stat-title text-xs">Collection Rate</div>
            <div className="stat-value text-2xl text-info">
              {financeStats.totalFees > 0
                ? Math.round((financeStats.totalPaid / financeStats.totalFees) * 100)
                : 0}
              %
            </div>
            <div className="stat-desc text-xs">Payment progress</div>
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
                      <FaClock className="text-5xl text-base-content/20" />
                      <p className="text-lg font-semibold">No due fees found</p>
                      <p className="text-sm">
                        {globalFilter
                          ? "Try adjusting your search"
                          : "All fees are cleared!"}
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
                                      {new Date(
                                        payment.date
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-base-content/60 text-center py-4">
                                No payment history yet
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
                <FaClock className="text-5xl text-base-content/20" />
                <p className="text-lg font-semibold">No due fees found</p>
                <p className="text-sm">
                  {globalFilter
                    ? "Try adjusting your search"
                    : "All fees are cleared!"}
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
                  <div className="p-4 bg-base-100">
                    <div
                      className="cursor-pointer"
                      onClick={() => toggleMobileRowExpansion(row.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: Student Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-linear-to-br from-warning to-error rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <MdPerson className="text-white text-lg" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base-content truncate">
                              {studentInfo?.name || "Unknown Student"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="badge badge-warning badge-sm">
                                Due
                              </span>
                              <span className="text-xs text-error font-semibold">
                                ৳{fee.dueAmount?.toLocaleString()}
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
                      <div className="mt-4 pt-3 border-t border-base-300 space-y-3">
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
                          <FaMoneyCheck className="text-success shrink-0" />
                          <span className="text-base-content/70">
                            Paid: ৳{fee.paidAmount?.toLocaleString()}
                          </span>
                        </div>

                        {/* Due Amount */}
                        <div className="flex items-center gap-2 text-sm">
                          <FaExclamationTriangle className="text-error shrink-0" />
                          <span className="text-base-content/70">
                            Due: ৳{fee.dueAmount?.toLocaleString()}
                          </span>
                        </div>

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
                                  className="flex items-center justify-between p-2 bg-base-200 rounded-lg"
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
                                      }
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add Payment Button */}
                        <div className="pt-3">
                          <button
                            onClick={() => handleOpenPaymentModal(fee)}
                            className="btn btn-sm btn-primary text-white w-full shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <MdPayment className="text-lg" />
                            Add Payment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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

      {/* Payment Modal - Portaled to document.body to escape drawer stacking context */}
      {paymentModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-modalBackdropIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal Container */}
          <div className="relative z-[10000] bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modalSlideUp border border-base-300">

            {/* Gradient Header Banner */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-t-2xl relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />

              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Add Payment</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <MdPerson className="text-white/80" />
                    <span className="text-white/90 font-medium">
                      {getStudentName(paymentModal.feeData?.studentId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MdSchool className="text-white/80 text-sm" />
                    <span className="text-white/80 text-sm">
                      {getBatchName(paymentModal.feeData?.batchId)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-circle btn-sm bg-white/20 border-0 hover:bg-white/30 text-white"
                  disabled={paymentMutation.isPending}
                >
                  <MdClose className="text-lg" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {/* Payment Progress */}
              {(() => {
                const total = paymentModal.feeData?.fees || 0;
                const paid = paymentModal.feeData?.paidAmount || 0;
                const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;
                const circumference = 2 * Math.PI * 34;

                return (
                  <div className="flex items-center gap-4 p-4 bg-base-200 rounded-xl">
                    {/* Circular Progress Ring */}
                    <div className="relative w-20 h-20 shrink-0">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor"
                          className="text-base-300" strokeWidth="8" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor"
                          className="text-primary" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference * (1 - percentage / 100)}
                          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-base-content">{percentage}%</span>
                      </div>
                    </div>

                    <div className="text-sm text-base-content/70">
                      <p><span className="font-semibold text-base-content">{percentage}%</span> of total fees paid</p>
                      <p className="text-xs mt-1">৳{paid.toLocaleString()} of ৳{total.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Fee Breakdown Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-base-200 rounded-xl p-3 text-center border border-base-300">
                  <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <TbCurrencyTaka className="text-info text-lg" />
                  </div>
                  <p className="text-xs text-base-content/60">Total Fee</p>
                  <p className="font-bold text-base-content text-sm">
                    ৳{(paymentModal.feeData?.fees || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-success/5 rounded-xl p-3 text-center border border-success/20">
                  <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FaMoneyCheck className="text-success text-sm" />
                  </div>
                  <p className="text-xs text-base-content/60">Paid</p>
                  <p className="font-bold text-success text-sm">
                    ৳{(paymentModal.feeData?.paidAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-error/5 rounded-xl p-3 text-center border border-error/20">
                  <div className="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FaExclamationTriangle className="text-error text-sm" />
                  </div>
                  <p className="text-xs text-base-content/60">Remaining</p>
                  <p className="font-bold text-error text-sm">
                    ৳{(paymentModal.feeData?.dueAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmitPayment}>
                <div className="space-y-5">

                  {/* Quick-Fill Amount Buttons + Custom Input */}
                  <div>
                    <label className="block text-sm font-semibold text-base-content mb-3">
                      Payment Amount
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => setPaymentAmount(String(paymentModal.feeData?.dueAmount || 0))}
                        className={`btn btn-sm h-auto py-3 ${
                          Number(paymentAmount) === paymentModal.feeData?.dueAmount
                            ? 'btn-primary text-white'
                            : 'btn-outline btn-primary'
                        } transition-all duration-200`}
                      >
                        <TbCurrencyTaka className="text-lg" />
                        <div className="text-left">
                          <div className="font-semibold">Pay Full</div>
                          <div className="text-xs opacity-80">
                            ৳{(paymentModal.feeData?.dueAmount || 0).toLocaleString()}
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentAmount(String(Math.ceil((paymentModal.feeData?.dueAmount || 0) / 2)))}
                        className={`btn btn-sm h-auto py-3 ${
                          Number(paymentAmount) === Math.ceil((paymentModal.feeData?.dueAmount || 0) / 2)
                            ? 'btn-secondary text-white'
                            : 'btn-outline btn-secondary'
                        } transition-all duration-200`}
                      >
                        <TbCurrencyTaka className="text-lg" />
                        <div className="text-left">
                          <div className="font-semibold">Pay Half</div>
                          <div className="text-xs opacity-80">
                            ৳{Math.ceil((paymentModal.feeData?.dueAmount || 0) / 2).toLocaleString()}
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Custom Amount Input */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <TbCurrencyTaka className="text-xl" />
                      </div>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={`Custom amount (max: ৳${paymentModal.feeData?.dueAmount})`}
                        className="w-full border border-base-300 rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20"
                        required
                        min="1"
                        max={paymentModal.feeData?.dueAmount}
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-semibold text-base-content mb-3">
                      Payment Method
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="relative cursor-pointer group">
                        <input
                          type="radio"
                          value="cash"
                          checked={paymentMethod === "cash"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="peer sr-only"
                        />
                        <div className="p-4 border-2 border-base-300 rounded-xl transition-all duration-300 peer-checked:border-success peer-checked:bg-success/5 peer-checked:shadow-md hover:border-success/50 group-hover:shadow-sm">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                              <FaMoneyBillWave className="text-success text-xl" />
                            </div>
                            <span className="font-semibold text-sm text-base-content">Cash</span>
                            <span className="text-xs text-base-content/50">Pay with cash</span>
                          </div>
                        </div>
                      </label>

                      <label className="relative cursor-pointer group">
                        <input
                          type="radio"
                          value="online"
                          checked={paymentMethod === "online"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="peer sr-only"
                        />
                        <div className="p-4 border-2 border-base-300 rounded-xl transition-all duration-300 peer-checked:border-info peer-checked:bg-info/5 peer-checked:shadow-md hover:border-info/50 group-hover:shadow-sm">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                              <BiSolidBank className="text-info text-xl" />
                            </div>
                            <span className="font-semibold text-sm text-base-content">Online</span>
                            <span className="text-xs text-base-content/50">Bank transfer</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-base-300">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-ghost"
                    disabled={paymentMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentMutation.isPending || !paymentAmount}
                    className="btn btn-primary text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {paymentMutation.isPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <MdPayment />
                        Confirm Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default FeesDues;
