import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MdFilterList,
  MdCalendarToday,
  MdSchool,
  MdPerson,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import {
  FaChartPie,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardCheck,
  FaCalendarAlt,
} from "react-icons/fa";
import { BiSolidUserCheck, BiSolidUserX } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Loader from "../../components/Loader";

const AttendenceReports = () => {
  const axiosSecure = useAxiosSecure();
  const [filterBatchId, setFilterBatchId] = useState("");
  const [filterDate, setFilterDate] = useState("");
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

  // Fetch batches
  const { data: batches = [] } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data;
    },
  });

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data;
    },
  });

  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ["attendanceReports", filterBatchId, filterDate],
    queryFn: async () => {
      let url = "/attendences?";
      if (filterBatchId) url += `batchId=${filterBatchId}&`;
      if (filterDate) url += `date=${filterDate}&`;
      const res = await axiosSecure.get(url);
      return res.data;
    },
  });

  // Helper functions
  const getBatchInfo = (batchId) => {
    const batch = batches.find((b) => b._id === batchId);
    if (batch) {
      return `${batch.name} - ${batch.course}`;
    }
    return "Unknown Batch";
  };

  const getStudentName = (studentId) => {
    const student = students.find((s) => s._id === studentId);
    return student?.name || "Unknown Student";
  };

  // Calculate statistics
  const stats = useMemo(() => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalSessions = attendanceRecords.length;

    attendanceRecords.forEach((record) => {
      record.records?.forEach((r) => {
        if (r.status === "present") totalPresent++;
        else if (r.status === "absent") totalAbsent++;
      });
    });

    const totalRecords = totalPresent + totalAbsent;
    const attendanceRate =
      totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : 0;

    return {
      totalSessions,
      totalPresent,
      totalAbsent,
      totalRecords,
      attendanceRate,
    };
  }, [attendanceRecords]);

  if (isLoading) {
    return <Loader message="Loading attendance reports..." />;
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
              Attendance Reports & Analytics
            </h1>
            <p className="text-base-content/60 mt-2 ml-15">
              View comprehensive attendance records and statistics
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex items-center gap-2 mb-4">
          <MdFilterList className="text-primary text-xl" />
          <h2 className="text-lg font-semibold text-base-content">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Batch Filter */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Select Batch
            </label>
            <div className="relative">
              <MdSchool className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
              <select
                value={filterBatchId}
                onChange={(e) => setFilterBatchId(e.target.value)}
                className="select select-bordered w-full pl-10 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} - {batch.course}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Select Date
            </label>
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="input input-bordered w-full pl-10 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {(filterBatchId || filterDate) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-base-content/60">
              Active filters:
            </span>
            {filterBatchId && (
              <div className="badge badge-primary gap-2">
                Batch: {getBatchInfo(filterBatchId)}
                <button
                  onClick={() => setFilterBatchId("")}
                  className="hover:text-primary-content/80"
                >
                  ×
                </button>
              </div>
            )}
            {filterDate && (
              <div className="badge badge-secondary gap-2">
                Date: {new Date(filterDate).toLocaleDateString()}
                <button
                  onClick={() => setFilterDate("")}
                  className="hover:text-secondary-content/80"
                >
                  ×
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setFilterBatchId("");
                setFilterDate("");
              }}
              className="text-xs link link-error"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Sessions */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-primary">
              <FaClipboardCheck className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Sessions</div>
            <div className="stat-value text-2xl text-primary">
              {stats.totalSessions}
            </div>
          </div>
        </div>

        {/* Total Records */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-info">
              <FaUsers className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Records</div>
            <div className="stat-value text-2xl text-info">
              {stats.totalRecords}
            </div>
          </div>
        </div>

        {/* Present */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-success">
              <FaCheckCircle className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Present</div>
            <div className="stat-value text-2xl text-success">
              {stats.totalPresent}
            </div>
          </div>
        </div>

        {/* Absent */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-error">
              <FaTimesCircle className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Absent</div>
            <div className="stat-value text-2xl text-error">
              {stats.totalAbsent}
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-warning">
              <FaChartPie className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Attendance Rate</div>
            <div className="stat-value text-2xl text-warning">
              {stats.attendanceRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records Section */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
        <div className="p-6 border-b border-base-300">
          <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
            <FaCalendarAlt className="text-primary" />
            Attendance Records ({attendanceRecords.length})
          </h3>
        </div>

        {attendanceRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <FaClipboardCheck className="text-5xl text-base-content/20" />
              <p className="text-lg font-semibold text-base-content/60">
                No attendance records found
              </p>
              <p className="text-sm text-base-content/40">
                {filterBatchId || filterDate
                  ? "Try adjusting your filters"
                  : "Attendance records will appear here"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table table-zebra">
                <thead className="bg-base-200">
                  <tr>
                    <th className="text-base-content font-semibold">Date</th>
                    <th className="text-base-content font-semibold">Batch</th>
                    <th className="text-base-content font-semibold text-center">
                      Total Students
                    </th>
                    <th className="text-base-content font-semibold text-center">
                      Present
                    </th>
                    <th className="text-base-content font-semibold text-center">
                      Absent
                    </th>
                    <th className="text-base-content font-semibold text-center">
                      Rate
                    </th>
                    <th className="text-base-content font-semibold">
                      Taken By
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => {
                    const presentCount =
                      record.records?.filter((r) => r.status === "present")
                        .length || 0;
                    const absentCount =
                      record.records?.filter((r) => r.status === "absent")
                        .length || 0;
                    const totalCount = record.records?.length || 0;
                    const rate =
                      totalCount > 0
                        ? ((presentCount / totalCount) * 100).toFixed(1)
                        : 0;

                    return (
                      <tr
                        key={record._id}
                        className="hover:bg-base-200/50 transition-colors"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Date */}
                        <td>
                          <div className="flex items-center gap-2">
                            <MdCalendarToday className="text-primary" />
                            <div>
                              <div className="font-semibold text-sm">
                                {new Date(record.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </div>
                              <div className="text-xs text-base-content/60">
                                {new Date(record.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Batch */}
                        <td>
                          <div className="flex items-center gap-2">
                            <MdSchool className="text-secondary" />
                            <span className="font-medium">
                              {getBatchInfo(record.batchId)}
                            </span>
                          </div>
                        </td>

                        {/* Total Students */}
                        <td className="text-center">
                          <span className="badge badge-ghost font-semibold">
                            {totalCount}
                          </span>
                        </td>

                        {/* Present */}
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <BiSolidUserCheck className="text-success" />
                            <span className="font-semibold text-success">
                              {presentCount}
                            </span>
                          </div>
                        </td>

                        {/* Absent */}
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <BiSolidUserX className="text-error" />
                            <span className="font-semibold text-error">
                              {absentCount}
                            </span>
                          </div>
                        </td>

                        {/* Rate */}
                        <td className="text-center">
                          <div
                            className={`badge ${
                              rate >= 80
                                ? "badge-success"
                                : rate >= 60
                                ? "badge-warning"
                                : "badge-error"
                            } font-semibold`}
                          >
                            {rate}%
                          </div>
                        </td>

                        {/* Taken By */}
                        <td>
                          <span className="text-sm text-base-content/70 capitalize">
                            {record.takenBy}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Accordion View */}
            <div className="md:hidden">
              {attendanceRecords.map((record, index) => {
                const isExpanded = mobileExpandedRows.has(record._id);
                const presentCount =
                  record.records?.filter((r) => r.status === "present")
                    .length || 0;
                const absentCount =
                  record.records?.filter((r) => r.status === "absent").length ||
                  0;
                const totalCount = record.records?.length || 0;
                const rate =
                  totalCount > 0
                    ? ((presentCount / totalCount) * 100).toFixed(1)
                    : 0;

                return (
                  <div
                    key={record._id}
                    className="border-b border-base-300 last:border-b-0 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Collapsed Row */}
                    <div
                      className="p-4 hover:bg-base-200 transition-colors cursor-pointer"
                      onClick={() => toggleMobileRowExpansion(record._id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: Date & Batch */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-10 h-10 bg-linear-to-br ${
                              rate >= 80
                                ? "from-success to-primary"
                                : rate >= 60
                                ? "from-warning to-orange-500"
                                : "from-error to-red-600"
                            } rounded-xl flex items-center justify-center shadow-sm shrink-0`}
                          >
                            <MdCalendarToday className="text-white text-lg" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base-content truncate">
                              {new Date(record.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`badge badge-sm ${
                                  rate >= 80
                                    ? "badge-success"
                                    : rate >= 60
                                    ? "badge-warning"
                                    : "badge-error"
                                }`}
                              >
                                {rate}%
                              </span>
                              <span className="text-xs text-base-content/60">
                                {presentCount}/{totalCount}
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
                        {/* Batch */}
                        <div className="flex items-center gap-2 text-sm">
                          <MdSchool className="text-primary shrink-0" />
                          <span className="text-base-content/70">
                            {getBatchInfo(record.batchId)}
                          </span>
                        </div>

                        {/* Total Students */}
                        <div className="flex items-center gap-2 text-sm">
                          <FaUsers className="text-info shrink-0" />
                          <span className="text-base-content/70">
                            Total: {totalCount} students
                          </span>
                        </div>

                        {/* Present */}
                        <div className="flex items-center gap-2 text-sm">
                          <BiSolidUserCheck className="text-success shrink-0" />
                          <span className="text-base-content/70">
                            Present: {presentCount}
                          </span>
                        </div>

                        {/* Absent */}
                        <div className="flex items-center gap-2 text-sm">
                          <BiSolidUserX className="text-error shrink-0" />
                          <span className="text-base-content/70">
                            Absent: {absentCount}
                          </span>
                        </div>

                        {/* Taken By */}
                        <div className="flex items-center gap-2 text-sm">
                          <MdPerson className="text-primary shrink-0" />
                          <span className="text-base-content/70 capitalize">
                            Taken by: {record.takenBy}
                          </span>
                        </div>

                        {/* Student Details */}
                        {record.records && record.records.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-base-300">
                            <h4 className="text-sm font-semibold text-base-content mb-2">
                              Student Details
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {record.records.map((r, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-base-100 rounded-lg"
                                >
                                  <span className="text-xs text-base-content truncate">
                                    {getStudentName(r.studentId)}
                                  </span>
                                  <span
                                    className={`badge badge-xs ${
                                      r.status === "present"
                                        ? "badge-success"
                                        : "badge-error"
                                    }`}
                                  >
                                    {r.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-info/10 border border-info/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center shrink-0">
            <FaChartPie className="text-info" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-base-content mb-1">
              Report Information
            </h4>
            <p className="text-xs text-base-content/60">
              This report displays all attendance records with detailed
              statistics. Use filters to view specific batch or date records.
              Attendance rate is calculated as (Present / Total) × 100.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendenceReports;
