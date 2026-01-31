import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaClipboardList,
  FaChartLine,
  FaExclamationTriangle,
  FaUsers,
  FaSearch,
  FaMoneyBillWave,
} from "react-icons/fa";
import {
  MdSchool,
  MdAccessTime,
  MdCalendarToday,
  MdPerson,
  MdGroup,
  MdAttachMoney,
  MdPeople,
  MdVisibility,
} from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";

const BatchDetails = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [studentSearch, setStudentSearch] = useState("");

  const defaultProfileImage =
    "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

  // Fetch all batches (reuses cache from Batches list page)
  const { data: batchesData, isLoading: batchLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const response = await axiosSecure.get("/batches?limit=1000");
      return response.data.data;
    },
  });

  // Find the specific batch
  const batch = batchesData?.find((b) => b._id === batchId);

  // Fetch students for this batch
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["batch-students", batchId],
    queryFn: async () => {
      const response = await axiosSecure.get(
        `/students?batchId=${batchId}&limit=1000`
      );
      return response.data.data;
    },
    enabled: !!batchId,
  });

  // Fetch attendance records for this batch
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ["batch-attendance", batchId],
    queryFn: async () => {
      const response = await axiosSecure.get(
        `/attendences?batchId=${batchId}&limit=1000`
      );
      return response.data.data;
    },
    enabled: !!batchId,
  });

  // Fetch exams for this batch
  const { data: examsData, isLoading: examsLoading } = useQuery({
    queryKey: ["batch-exams", batchId],
    queryFn: async () => {
      const response = await axiosSecure.get(
        `/exams?batchId=${batchId}&limit=1000`
      );
      return response.data.data;
    },
    enabled: !!batchId,
  });

  // Filter active students
  const activeStudents = useMemo(() => {
    if (!studentsData) return [];
    return studentsData.filter((s) => s.status !== "deleted");
  }, [studentsData]);

  // Filtered students for search
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return activeStudents;
    const search = studentSearch.toLowerCase();
    return activeStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(search) ||
        s.roll?.toString().includes(search) ||
        s.phone?.includes(search) ||
        s.email?.toLowerCase().includes(search)
    );
  }, [activeStudents, studentSearch]);

  // Calculate overall batch attendance stats
  const batchAttendanceStats = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) {
      return {
        totalClasses: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        totalRecords: 0,
        percentage: 0,
      };
    }

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalRecords = 0;

    attendanceData.forEach((session) => {
      if (session.records && Array.isArray(session.records)) {
        session.records.forEach((record) => {
          totalRecords++;
          if (record.status === "present") totalPresent++;
          else if (record.status === "absent") totalAbsent++;
          else if (record.status === "late") totalLate++;
        });
      }
    });

    const percentage =
      totalRecords > 0
        ? Math.round((totalPresent / totalRecords) * 100)
        : 0;

    return {
      totalClasses: attendanceData.length,
      totalPresent,
      totalAbsent,
      totalLate,
      totalRecords,
      percentage,
    };
  }, [attendanceData]);

  // Calculate per-student attendance
  const studentAttendanceMap = useMemo(() => {
    if (!attendanceData || !activeStudents) return {};

    const map = {};

    activeStudents.forEach((student) => {
      map[student._id] = {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        percentage: 0,
      };
    });

    attendanceData.forEach((session) => {
      if (session.records && Array.isArray(session.records)) {
        session.records.forEach((record) => {
          if (map[record.studentId]) {
            map[record.studentId].total++;
            if (record.status === "present") map[record.studentId].present++;
            else if (record.status === "absent")
              map[record.studentId].absent++;
            else if (record.status === "late") map[record.studentId].late++;
          }
        });
      }
    });

    Object.keys(map).forEach((id) => {
      const stats = map[id];
      stats.percentage =
        stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    });

    return map;
  }, [attendanceData, activeStudents]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: "badge-success", icon: FaCheckCircle, text: "Active" },
      inactive: { class: "badge-warning", icon: FaClock, text: "Inactive" },
      completed: {
        class: "badge-info",
        icon: FaCheckCircle,
        text: "Completed",
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span className={`badge ${config.class} gap-1`}>
        <Icon className="text-xs" />
        {config.text}
      </span>
    );
  };

  // Get attendance color based on percentage
  const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-error";
  };

  // Loading state
  if (batchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60 animate-pulse">
            Loading batch details...
          </p>
        </div>
      </div>
    );
  }

  // Batch not found
  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
        <FaExclamationTriangle className="text-6xl text-warning mb-4" />
        <h2 className="text-2xl font-bold text-base-content mb-2">
          Batch Not Found
        </h2>
        <p className="text-base-content/60 mb-4">
          The batch you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/dashboard/batchManagement/batches")}
          className="btn btn-primary"
        >
          <FaArrowLeft className="mr-2" />
          Back to Batches
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/batchManagement/batches")}
            className="btn btn-ghost btn-circle hover:bg-base-200 transition-all duration-300"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          <div className="flex items-center gap-4">
            <div className="animate-scaleIn">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <MdSchool className="text-white text-3xl" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                  {batch.name}
                </h1>
                {getStatusBadge(batch.status)}
              </div>
              <div className="flex items-center gap-2 mt-1 text-base-content/60 text-sm">
                <MdSchool />
                <span>{batch.course || "N/A"}</span>
                <span className="text-base-content/30">|</span>
                <MdPerson />
                <span>{batch.instructor || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/dashboard/batchManagement/batches")}
            className="btn btn-outline btn-sm lg:btn-md"
          >
            <FaArrowLeft className="mr-1" />
            Back
          </button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp"
        style={{ animationDelay: "0.1s" }}
      >
        {/* Students Card */}
        <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60 uppercase tracking-wider">
                  Students
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-primary">
                  {studentsLoading ? "..." : activeStudents.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <FaUsers className="text-xl text-primary" />
              </div>
            </div>
            <div className="text-xs text-base-content/60 mt-2">
              Capacity: {batch.capacity || "N/A"}
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="card bg-gradient-to-br from-success/10 to-success/5 border border-success/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60 uppercase tracking-wider">
                  Attendance
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-success">
                  {attendanceLoading
                    ? "..."
                    : `${batchAttendanceStats.percentage}%`}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <FaClipboardList className="text-xl text-success" />
              </div>
            </div>
            <div className="text-xs text-base-content/60 mt-2">
              {batchAttendanceStats.totalClasses} classes taken
            </div>
          </div>
        </div>

        {/* Exams Card */}
        <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60 uppercase tracking-wider">
                  Exams
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-secondary">
                  {examsLoading ? "..." : examsData?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <FaChartLine className="text-xl text-secondary" />
              </div>
            </div>
            <div className="text-xs text-base-content/60 mt-2">
              exams conducted
            </div>
          </div>
        </div>

        {/* Fees Card */}
        <div className="card bg-gradient-to-br from-info/10 to-info/5 border border-info/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60 uppercase tracking-wider">
                  Fees
                </p>
                <p className="text-lg lg:text-xl font-bold text-info">
                  {formatCurrency(batch.fees)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center">
                <TbCurrencyTaka className="text-xl text-info" />
              </div>
            </div>
            <div className="text-xs text-base-content/60 mt-2">per student</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Batch Information Card */}
          <div
            className="card bg-base-100 shadow border border-base-300 animate-slideUp"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MdSchool className="text-primary" />
                </div>
                Batch Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InfoRow
                  icon={MdSchool}
                  label="Batch Name"
                  value={batch.name}
                  iconColor="text-primary"
                />
                <InfoRow
                  icon={MdGroup}
                  label="Course"
                  value={batch.course || "N/A"}
                  iconColor="text-secondary"
                />
                <InfoRow
                  icon={MdPerson}
                  label="Instructor"
                  value={batch.instructor || "N/A"}
                  iconColor="text-info"
                />
                <InfoRow
                  icon={MdAccessTime}
                  label="Schedule"
                  value={batch.schedule || "N/A"}
                  iconColor="text-warning"
                />
                <InfoRow
                  icon={MdCalendarToday}
                  label="Start Date"
                  value={formatDate(batch.startDate)}
                  iconColor="text-success"
                />
                <InfoRow
                  icon={MdCalendarToday}
                  label="End Date"
                  value={formatDate(batch.endDate)}
                  iconColor="text-error"
                />
                <InfoRow
                  icon={MdPeople}
                  label="Capacity"
                  value={batch.capacity || "N/A"}
                  iconColor="text-primary"
                />
                <InfoRow
                  icon={MdAttachMoney}
                  label="Fees"
                  value={formatCurrency(batch.fees)}
                  iconColor="text-secondary"
                />
              </div>
            </div>
          </div>

          {/* Exams Card */}
          <div
            className="card bg-base-100 shadow border border-base-300 animate-slideUp"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <FaChartLine className="text-warning" />
                </div>
                Exams
                {examsData && examsData.length > 0 && (
                  <span className="badge badge-primary badge-sm">
                    {examsData.length}
                  </span>
                )}
              </h2>

              {examsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : examsData && examsData.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                  <table className="table table-zebra table-sm">
                    <thead>
                      <tr>
                        <th>Exam Name</th>
                        <th>Date</th>
                        <th>Total Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examsData.map((exam, index) => (
                        <tr
                          key={exam._id}
                          className="hover animate-fadeIn"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <td className="font-medium">{exam.name}</td>
                          <td className="text-base-content/60">
                            {formatDate(exam.date)}
                          </td>
                          <td>{exam.totalMarks || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/60">
                  <FaChartLine className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No exams conducted yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Attendance Summary Card */}
          <div
            className="card bg-base-100 shadow border border-base-300 animate-slideUp"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <FaClipboardList className="text-success" />
                </div>
                Attendance Summary
              </h2>

              {attendanceLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : (
                <>
                  {/* Circular Progress */}
                  <div className="flex justify-center my-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-base-300"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-success transition-all duration-1000"
                          strokeDasharray={`${batchAttendanceStats.percentage * 3.52} 352`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {batchAttendanceStats.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MdCalendarToday className="text-primary" />
                        <span>Total Classes</span>
                      </div>
                      <span className="font-bold">
                        {batchAttendanceStats.totalClasses}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-success" />
                        <span>Present</span>
                      </div>
                      <span className="font-bold text-success">
                        {batchAttendanceStats.totalPresent}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-error/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaTimesCircle className="text-error" />
                        <span>Absent</span>
                      </div>
                      <span className="font-bold text-error">
                        {batchAttendanceStats.totalAbsent}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-warning" />
                        <span>Late</span>
                      </div>
                      <span className="font-bold text-warning">
                        {batchAttendanceStats.totalLate}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div
            className="card bg-base-100 shadow border border-base-300 animate-slideUp"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="card-body">
              <h2 className="card-title text-lg">Quick Actions</h2>
              <div className="space-y-2 mt-2">
                <button
                  onClick={() =>
                    navigate("/dashboard/batchManagement/batches")
                  }
                  className="btn btn-outline btn-sm w-full justify-start gap-2 hover:scale-[1.02] transition-transform"
                >
                  <FaArrowLeft />
                  Back to Batches
                </button>
                <button
                  onClick={() =>
                    navigate("/dashboard/attendenceManagement/attendence")
                  }
                  className="btn btn-outline btn-sm w-full justify-start gap-2 hover:scale-[1.02] transition-transform"
                >
                  <FaClipboardList />
                  View All Attendance
                </button>
                <button
                  onClick={() =>
                    navigate("/dashboard/performanceManagement/exams")
                  }
                  className="btn btn-outline btn-sm w-full justify-start gap-2 hover:scale-[1.02] transition-transform"
                >
                  <FaChartLine />
                  View All Exams
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Enrolled - Full Width */}
      <div
        className="card bg-base-100 shadow border border-base-300 animate-slideUp"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="card-title text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FaUserGraduate className="text-primary" />
              </div>
              Students Enrolled
              {activeStudents.length > 0 && (
                <span className="badge badge-primary badge-sm">
                  {activeStudents.length}
                </span>
              )}
            </h2>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-4 py-2 bg-base-200 rounded-lg border border-base-300 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {studentsLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : filteredStudents.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-zebra table-sm">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll</th>
                      <th>Phone</th>
                      <th>Attendance</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => {
                      const attStats = studentAttendanceMap[student._id] || {
                        percentage: 0,
                        present: 0,
                        total: 0,
                      };
                      return (
                        <tr
                          key={student._id}
                          className="hover animate-fadeIn"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="w-8 h-8 rounded-full">
                                  <img
                                    src={
                                      student.image || defaultProfileImage
                                    }
                                    alt={student.name}
                                    onError={(e) => {
                                      e.target.src = defaultProfileImage;
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {student.name}
                                </div>
                                <div className="text-xs text-base-content/60">
                                  {student.email || ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{student.roll || "N/A"}</td>
                          <td className="text-base-content/70">
                            {student.phone || "N/A"}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-medium ${getAttendanceColor(attStats.percentage)}`}
                              >
                                {attStats.percentage}%
                              </span>
                              <span className="text-xs text-base-content/50">
                                ({attStats.present}/{attStats.total})
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge badge-sm ${student.status === "active" ? "badge-success" : "badge-ghost"}`}
                            >
                              {student.status || "active"}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/studentManagement/students/${student._id}`
                                )
                              }
                              className="btn btn-sm btn-ghost text-primary hover:bg-primary/10"
                              title="View Student Details"
                            >
                              <MdVisibility />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredStudents.map((student, index) => {
                  const attStats = studentAttendanceMap[student._id] || {
                    percentage: 0,
                    present: 0,
                    total: 0,
                  };
                  return (
                    <div
                      key={student._id}
                      className="p-4 bg-base-200/30 rounded-xl border border-base-300/50 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full">
                              <img
                                src={student.image || defaultProfileImage}
                                alt={student.name}
                                onError={(e) => {
                                  e.target.src = defaultProfileImage;
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {student.name}
                            </div>
                            <div className="text-xs text-base-content/60">
                              Roll: {student.roll || "N/A"}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/studentManagement/students/${student._id}`
                            )
                          }
                          className="btn btn-sm btn-ghost text-primary"
                        >
                          <MdVisibility />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300/50">
                        <div className="text-xs text-base-content/60">
                          {student.phone || "No phone"}
                        </div>
                        <div
                          className={`text-sm font-medium ${getAttendanceColor(attStats.percentage)}`}
                        >
                          Attendance: {attStats.percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-base-content/60">
              <FaUserGraduate className="text-4xl mx-auto mb-2 opacity-50" />
              <p>
                {studentSearch
                  ? "No students match your search"
                  : "No students enrolled in this batch"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Info Row Component
const InfoRow = ({ icon: Icon, label, value, iconColor = "text-primary" }) => (
  <div className="flex items-start gap-3 p-3 bg-base-200/30 rounded-lg hover:bg-base-200/50 transition-colors">
    <div className={`mt-0.5 ${iconColor}`}>
      <Icon className="text-lg" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-base-content/60 uppercase tracking-wider">
        {label}
      </p>
      <p className="font-medium text-base-content truncate">{value}</p>
    </div>
  </div>
);

export default BatchDetails;
