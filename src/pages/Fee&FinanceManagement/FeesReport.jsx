import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MdDownload,
  MdAttachMoney,
  MdCalendarToday,
  MdPerson,
  MdFilterList,
  MdExpandMore,
  MdExpandLess,
  MdSchool,
  MdPayment,
} from "react-icons/md";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaChartPie,
  FaFileExcel,
  FaUsers,
  FaMoneyCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { BiSolidBank } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import * as XLSX from "xlsx";

const FeesReport = () => {
  const axiosSecure = useAxiosSecure();
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
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

  // Fetch all fees
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

  // Filter fees based on selected filters
  const filteredFees = useMemo(() => {
    let filtered = [...fees];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (fee) => fee.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Payment method filter
    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(
        (fee) =>
          fee.paymentMethod?.toLowerCase() === paymentMethodFilter.toLowerCase()
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((fee) => {
        const feeDate = new Date(fee.createdAt);

        switch (dateFilter) {
          case "today":
            return feeDate >= today;
          case "week": {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return feeDate >= weekAgo;
          }
          case "month": {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return feeDate >= monthAgo;
          }
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [fees, statusFilter, paymentMethodFilter, dateFilter]);

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const totalFees = filteredFees.reduce(
      (sum, fee) => sum + (fee.totalFee || 0),
      0
    );
    const totalPaid = filteredFees.reduce(
      (sum, fee) => sum + (fee.paidAmount || 0),
      0
    );
    const totalDue = filteredFees.reduce(
      (sum, fee) => sum + (fee.dueAmount || 0),
      0
    );

    const clearCount = filteredFees.filter((f) => f.status === "clear").length;
    const dueCount = filteredFees.filter((f) => f.status === "due").length;

    const cashPayments = filteredFees.filter(
      (f) => f.paymentMethod === "cash"
    ).length;
    const onlinePayments = filteredFees.filter(
      (f) => f.paymentMethod === "online"
    ).length;

    const cashAmount = filteredFees
      .filter((f) => f.paymentMethod === "cash")
      .reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);

    const onlineAmount = filteredFees
      .filter((f) => f.paymentMethod === "online")
      .reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);

    const collectionRate = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

    return {
      totalFees,
      totalPaid,
      totalDue,
      clearCount,
      dueCount,
      cashPayments,
      onlinePayments,
      cashAmount,
      onlineAmount,
      collectionRate,
      totalRecords: filteredFees.length,
    };
  }, [filteredFees]);

  // Export to Excel
  const handleExportToExcel = () => {
    // Prepare data for export
    const exportData = filteredFees.map((fee) => ({
      "Student Name": getStudentName(fee.studentId),
      "Phone Number": getStudentPhone(fee.studentId),
      Batch: getBatchName(fee.batchId),
      "Total Fee": fee.totalFee || 0,
      "Paid Amount": fee.paidAmount || 0,
      "Due Amount": fee.dueAmount || 0,
      "Payment Method": fee.paymentMethod || "N/A",
      Status: fee.status || "N/A",
      "Created Date": fee.createdAt
        ? new Date(fee.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A",
      "Last Payment Date": fee.lastPaymentDate
        ? new Date(fee.lastPaymentDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A",
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add main data sheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    ws["!cols"] = [
      { wch: 20 }, // Student Name
      { wch: 15 }, // Phone
      { wch: 15 }, // Batch
      { wch: 12 }, // Total Fee
      { wch: 12 }, // Paid Amount
      { wch: 12 }, // Due Amount
      { wch: 15 }, // Payment Method
      { wch: 10 }, // Status
      { wch: 15 }, // Created Date
      { wch: 15 }, // Last Payment
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Fee Records");

    // Add summary sheet
    const summaryData = [
      { Metric: "Total Records", Value: stats.totalRecords },
      { Metric: "Total Fees", Value: `$${stats.totalFees.toLocaleString()}` },
      {
        Metric: "Total Collected",
        Value: `$${stats.totalPaid.toLocaleString()}`,
      },
      { Metric: "Total Due", Value: `$${stats.totalDue.toLocaleString()}` },
      { Metric: "Cleared Records", Value: stats.clearCount },
      { Metric: "Pending Records", Value: stats.dueCount },
      {
        Metric: "Collection Rate",
        Value: `${stats.collectionRate.toFixed(2)}%`,
      },
      { Metric: "Cash Payments", Value: stats.cashPayments },
      {
        Metric: "Cash Amount",
        Value: `$${stats.cashAmount.toLocaleString()}`,
      },
      { Metric: "Online Payments", Value: stats.onlinePayments },
      {
        Metric: "Online Amount",
        Value: `$${stats.onlineAmount.toLocaleString()}`,
      },
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `Fees_Report_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/60">Loading fee report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-base-200 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-info to-primary rounded-xl flex items-center justify-center shadow-lg">
                <FaChartPie className="text-white text-xl" />
              </div>
              Fee Reports & Analytics
            </h1>
            <p className="text-base-content/60 mt-2 ml-15">
              Comprehensive fee collection reports and insights
            </p>
          </div>
          <button
            onClick={handleExportToExcel}
            className="btn btn-success text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaFileExcel className="text-lg" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex items-center gap-2 mb-4">
          <MdFilterList className="text-primary text-xl" />
          <h2 className="text-lg font-semibold text-base-content">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Payment Status
            </label>
            <select
              className="select select-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="clear">Cleared</option>
              <option value="due">Due</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Payment Method
            </label>
            <select
              className="select select-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Time Period
            </label>
            <select
              className="select select-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fees */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-primary">
              <MdAttachMoney className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Fees</div>
            <div className="stat-value text-2xl text-primary">
              ${stats.totalFees.toLocaleString()}
            </div>
            <div className="stat-desc text-xs">
              {stats.totalRecords} total records
            </div>
          </div>
        </div>

        {/* Total Collected */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-success">
              <FaMoneyCheck className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Collected</div>
            <div className="stat-value text-2xl text-success">
              ${stats.totalPaid.toLocaleString()}
            </div>
            <div className="stat-desc text-xs">{stats.clearCount} cleared</div>
          </div>
        </div>

        {/* Total Due */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-error">
              <FaExclamationTriangle className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Due</div>
            <div className="stat-value text-2xl text-error">
              ${stats.totalDue.toLocaleString()}
            </div>
            <div className="stat-desc text-xs">{stats.dueCount} pending</div>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-info">
              <FaChartPie className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Collection Rate</div>
            <div className="stat-value text-2xl text-info">
              {stats.collectionRate.toFixed(1)}%
            </div>
            <div className="stat-desc text-xs">Payment efficiency</div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Status Breakdown */}
        <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
          <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <FaChartPie className="text-primary" />
            Payment Status Breakdown
          </h3>
          <div className="space-y-4">
            {/* Cleared */}
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-xl border border-success/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="text-success text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content">
                    Cleared Fees
                  </p>
                  <p className="text-xs text-base-content/60">
                    Fully paid records
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-success">
                  {stats.clearCount}
                </p>
                <p className="text-xs text-base-content/60">
                  {stats.totalRecords > 0
                    ? ((stats.clearCount / stats.totalRecords) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>

            {/* Pending */}
            <div className="flex items-center justify-between p-4 bg-warning/10 rounded-xl border border-warning/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                  <FaClock className="text-warning text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content">
                    Pending Fees
                  </p>
                  <p className="text-xs text-base-content/60">
                    Awaiting payment
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-warning">
                  {stats.dueCount}
                </p>
                <p className="text-xs text-base-content/60">
                  {stats.totalRecords > 0
                    ? ((stats.dueCount / stats.totalRecords) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
          <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
            <FaMoneyBillWave className="text-primary" />
            Payment Method Breakdown
          </h3>
          <div className="space-y-4">
            {/* Cash Payments */}
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-xl border border-success/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                  <FaMoneyBillWave className="text-success text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content">
                    Cash Payments
                  </p>
                  <p className="text-xs text-base-content/60">
                    {stats.cashPayments} transactions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-success">
                  ${stats.cashAmount.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/60">
                  {stats.totalPaid > 0
                    ? ((stats.cashAmount / stats.totalPaid) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>

            {/* Online Payments */}
            <div className="flex items-center justify-between p-4 bg-info/10 rounded-xl border border-info/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center">
                  <BiSolidBank className="text-info text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content">
                    Online Payments
                  </p>
                  <p className="text-xs text-base-content/60">
                    {stats.onlinePayments} transactions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-info">
                  ${stats.onlineAmount.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/60">
                  {stats.totalPaid > 0
                    ? ((stats.onlineAmount / stats.totalPaid) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Records Table */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
            <FaUsers className="text-primary" />
            Detailed Fee Records ({filteredFees.length})
          </h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="table table-zebra">
            <thead className="bg-base-200">
              <tr>
                <th>Student</th>
                <th>Batch</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FaChartPie className="text-5xl text-base-content/20" />
                      <p className="text-lg font-semibold text-base-content/60">
                        No records found
                      </p>
                      <p className="text-sm text-base-content/40">
                        Try adjusting your filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-base-200/50">
                    <td>
                      <div>
                        <div className="font-semibold text-sm">
                          {getStudentName(fee.studentId)}
                        </div>
                        <div className="text-xs text-base-content/60">
                          {getStudentPhone(fee.studentId)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm">
                        {getBatchName(fee.batchId)}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold">
                        ${fee.totalFee?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-success">
                        ${fee.paidAmount?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-error">
                        ${fee.dueAmount?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      {fee.paymentMethod === "cash" ? (
                        <span className="badge badge-success badge-sm">
                          Cash
                        </span>
                      ) : (
                        <span className="badge badge-info badge-sm">
                          Online
                        </span>
                      )}
                    </td>
                    <td>
                      {fee.status === "clear" ? (
                        <span className="badge badge-success badge-sm">
                          Clear
                        </span>
                      ) : (
                        <span className="badge badge-warning badge-sm">
                          Due
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-base-content/60">
                      {new Date(fee.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Accordion View */}
        <div className="md:hidden">
          {filteredFees.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <FaChartPie className="text-5xl text-base-content/20" />
                <p className="text-lg font-semibold text-base-content/60">
                  No records found
                </p>
                <p className="text-sm text-base-content/40">
                  Try adjusting your filters
                </p>
              </div>
            </div>
          ) : (
            filteredFees.map((fee, index) => {
              const isExpanded = mobileExpandedRows.has(fee._id);
              const studentInfo = getStudentInfo(fee.studentId);
              const batchInfo = getBatchInfo(fee.batchId);

              return (
                <div
                  key={fee._id}
                  className="border-b border-base-300 last:border-b-0 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Collapsed Row */}
                  <div
                    className="p-4 hover:bg-base-200 transition-colors cursor-pointer"
                    onClick={() => toggleMobileRowExpansion(fee._id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Student Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 bg-linear-to-br ${
                          fee.status === "clear"
                            ? "from-success to-primary"
                            : "from-warning to-error"
                        } rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                          <MdPerson className="text-white text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base-content truncate">
                            {studentInfo?.name || "Unknown Student"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`badge badge-sm ${
                                fee.status === "clear"
                                  ? "badge-success"
                                  : "badge-warning"
                              }`}
                            >
                              {fee.status === "clear" ? "Clear" : "Due"}
                            </span>
                            <span className="text-xs text-base-content/60">
                              ${fee.totalFee?.toLocaleString()}
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
                        <FaMoneyCheck className="text-success shrink-0" />
                        <span className="text-base-content/70">
                          Paid: ${fee.paidAmount?.toLocaleString()}
                        </span>
                      </div>

                      {/* Due Amount */}
                      {fee.dueAmount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <FaExclamationTriangle className="text-error shrink-0" />
                          <span className="text-base-content/70">
                            Due: ${fee.dueAmount?.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Payment Method */}
                      {fee.paymentMethod && (
                        <div className="flex items-center gap-2 text-sm">
                          {fee.paymentMethod === "cash" ? (
                            <>
                              <FaMoneyBillWave className="text-success shrink-0" />
                              <span className="text-base-content/70">
                                Cash Payment
                              </span>
                            </>
                          ) : (
                            <>
                              <BiSolidBank className="text-info shrink-0" />
                              <span className="text-base-content/70">
                                Online Payment
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Date */}
                      {fee.createdAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <MdCalendarToday className="text-primary shrink-0" />
                          <span className="text-base-content/70">
                            {new Date(fee.createdAt).toLocaleDateString(
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
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Export Info */}
      <div className="bg-info/10 border border-info/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center shrink-0">
            <MdDownload className="text-info" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-base-content mb-1">
              Export Information
            </h4>
            <p className="text-xs text-base-content/60">
              The Excel export includes two sheets: "Fee Records" with detailed
              transaction data and "Summary" with aggregated statistics. Click
              the "Export to Excel" button to download the report with current
              filter settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesReport;
