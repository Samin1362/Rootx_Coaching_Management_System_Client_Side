import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaFileAlt,
  FaDownload,
  FaCalendarAlt,
  FaBuilding,
  FaUsers,
  FaCreditCard,
  FaChartBar,
  FaFilter,
} from "react-icons/fa";

const Reports = () => {
  const axiosSecure = useAxiosSecure();

  const [selectedReport, setSelectedReport] = useState("organizations");
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch report data
  const { data: reportData, isLoading, error, refetch } = useQuery({
    queryKey: ["super-admin-report", selectedReport, dateRange, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: selectedReport,
        dateRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const response = await axiosSecure.get(`/super-admin/reports?${params}`);
      return response.data.data;
    },
  });

  const reportTypes = [
    {
      id: "organizations",
      name: "Organizations Report",
      icon: FaBuilding,
      description: "List of all organizations with details",
    },
    {
      id: "users",
      name: "Users Report",
      icon: FaUsers,
      description: "Platform user statistics and details",
    },
    {
      id: "subscriptions",
      name: "Subscriptions Report",
      icon: FaCreditCard,
      description: "Subscription status and revenue",
    },
    {
      id: "revenue",
      name: "Revenue Report",
      icon: FaChartBar,
      description: "Detailed revenue breakdown",
    },
  ];

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams({
        type: selectedReport,
        dateRange,
        format,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const response = await axiosSecure.get(`/super-admin/reports/export?${params}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedReport}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading report: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaFileAlt className="text-primary" />
            Reports
          </h1>
          <p className="text-base-content/60 mt-1">Generate and export platform reports</p>
        </div>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-primary btn-sm sm:btn-md">
            <FaDownload className="mr-1" /> Export
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40">
            <li>
              <button onClick={() => handleExport("csv")}>Export as CSV</button>
            </li>
            <li>
              <button onClick={() => handleExport("xlsx")}>Export as Excel</button>
            </li>
            <li>
              <button onClick={() => handleExport("pdf")}>Export as PDF</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            className={`card bg-base-100 shadow border-2 cursor-pointer transition-all hover:shadow-lg ${
              selectedReport === report.id ? "border-primary" : "border-base-300"
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${selectedReport === report.id ? "bg-primary text-white" : "bg-base-200"}`}>
                  <report.icon className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold">{report.name}</h3>
                  <p className="text-xs text-base-content/60">{report.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="form-control flex-1">
              <label className="label">
                <span className="label-text">Date Range</span>
              </label>
              <select
                className="select select-bordered"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Start Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">End Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <button className="btn btn-outline" onClick={() => refetch()}>
              <FaFilter className="mr-1" /> Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              {reportData?.summary && (
                <div className="p-4 bg-base-200 border-b border-base-300">
                  <h3 className="font-semibold mb-3">Summary</h3>
                  <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                    {Object.entries(reportData.summary).map(([key, value]) => (
                      <div key={key} className="stat">
                        <div className="stat-title capitalize">{key.replace(/([A-Z])/g, " $1")}</div>
                        <div className="stat-value text-lg">
                          {typeof value === "number"
                            ? key.toLowerCase().includes("revenue") || key.toLowerCase().includes("amount")
                              ? `$${value.toLocaleString()}`
                              : value.toLocaleString()
                            : value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      {reportData?.columns?.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.rows?.length > 0 ? (
                      reportData.rows.map((row, index) => (
                        <tr key={index} className="hover">
                          {reportData.columns.map((col) => (
                            <td key={col.key}>
                              {col.type === "date"
                                ? new Date(row[col.key]).toLocaleDateString()
                                : col.type === "currency"
                                ? `$${(row[col.key] || 0).toLocaleString()}`
                                : col.type === "badge"
                                ? <span className={`badge badge-sm ${getBadgeClass(row[col.key])}`}>{row[col.key]}</span>
                                : row[col.key] || "N/A"}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={reportData?.columns?.length || 5} className="text-center py-8 text-base-content/60">
                          No data available for the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {reportData?.pagination && (
                <div className="flex justify-center items-center gap-2 p-4 border-t border-base-300">
                  <span className="text-sm text-base-content/60">
                    Showing {reportData.rows?.length || 0} of {reportData.pagination.total || 0} records
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for badge classes
const getBadgeClass = (status) => {
  const statusLower = status?.toLowerCase();
  if (statusLower === "active") return "badge-success";
  if (statusLower === "trial") return "badge-warning";
  if (statusLower === "expired" || statusLower === "suspended" || statusLower === "banned") return "badge-error";
  return "badge-ghost";
};

export default Reports;
