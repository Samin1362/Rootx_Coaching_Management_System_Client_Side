import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaIdCard,
  FaUserTie,
  FaVenusMars,
  FaBirthdayCake,
  FaSchool,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartLine,
  FaClipboardList,
  FaPercentage,
  FaEdit,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  MdSchool,
  MdAccessTime,
  MdCalendarToday,
  MdPerson,
  MdGroup,
  MdAttachMoney,
  MdTrendingUp,
  MdAssignment,
} from "react-icons/md";

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  // Default profile image
  const defaultProfileImage =
    "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

  // Fetch student data
  const { data: studentsData, isLoading: studentLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await axiosSecure.get("/students?limit=1000");
      return response.data.data;
    },
  });

  // Find the specific student
  const student = studentsData?.find((s) => s._id === studentId);

  // Fetch batches for batch info
  const { data: batchesData } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const response = await axiosSecure.get("/batches?limit=1000");
      return response.data.data;
    },
  });

  // Get batch info
  const batch = batchesData?.find((b) => b._id === student?.batchId);

  // Fetch fees for this student
  const { data: feesData, isLoading: feesLoading } = useQuery({
    queryKey: ["student-fees", studentId],
    queryFn: async () => {
      const response = await axiosSecure.get(`/fees?studentId=${studentId}&limit=1000`);
      return response.data.data;
    },
    enabled: !!studentId,
  });

  // Fetch results for this student
  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ["student-results", studentId],
    queryFn: async () => {
      const response = await axiosSecure.get(`/results?studentId=${studentId}`);
      return response.data.data;
    },
    enabled: !!studentId,
  });

  // Fetch exams for the batch
  const { data: examsData } = useQuery({
    queryKey: ["batch-exams", student?.batchId],
    queryFn: async () => {
      const response = await axiosSecure.get(`/exams?batchId=${student?.batchId}`);
      return response.data.data;
    },
    enabled: !!student?.batchId,
  });

  // Fetch attendance for the batch
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ["batch-attendance", student?.batchId],
    queryFn: async () => {
      const response = await axiosSecure.get(`/attendences?batchId=${student?.batchId}`);
      return response.data.data;
    },
    enabled: !!student?.batchId,
  });

  // Calculate attendance stats for this student
  const calculateAttendanceStats = () => {
    if (!attendanceData || !studentId) return { present: 0, absent: 0, late: 0, total: 0, percentage: 0 };

    let present = 0;
    let absent = 0;
    let late = 0;
    let total = 0;

    attendanceData.forEach((record) => {
      const studentRecord = record.records?.find((r) => r.studentId === studentId);
      if (studentRecord) {
        total++;
        if (studentRecord.status === "present") present++;
        else if (studentRecord.status === "absent") absent++;
        else if (studentRecord.status === "late") late++;
      }
    });

    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, total, percentage };
  };

  const attendanceStats = calculateAttendanceStats();

  // Calculate fees stats
  const calculateFeesStats = () => {
    if (!feesData || feesData.length === 0) return { total: 0, paid: 0, due: 0 };

    const stats = feesData.reduce(
      (acc, fee) => ({
        total: acc.total + (fee.fees || 0),
        paid: acc.paid + (fee.paidAmount || 0),
        due: acc.due + (fee.dueAmount || 0),
      }),
      { total: 0, paid: 0, due: 0 }
    );

    return stats;
  };

  const feesStats = calculateFeesStats();

  // Calculate results stats
  const calculateResultsStats = () => {
    if (!resultsData || resultsData.length === 0 || !examsData) {
      return { totalExams: 0, appeared: 0, avgPercentage: 0, highest: 0, lowest: 0 };
    }

    const appeared = resultsData.length;
    let totalPercentage = 0;
    let highest = 0;
    let lowest = 100;

    resultsData.forEach((result) => {
      const exam = examsData.find((e) => e._id === result.examId);
      if (exam && exam.totalMarks > 0) {
        const percentage = (result.marks / exam.totalMarks) * 100;
        totalPercentage += percentage;
        if (percentage > highest) highest = percentage;
        if (percentage < lowest) lowest = percentage;
      }
    });

    const avgPercentage = appeared > 0 ? Math.round(totalPercentage / appeared) : 0;

    return {
      totalExams: examsData.length,
      appeared,
      avgPercentage,
      highest: Math.round(highest),
      lowest: appeared > 0 ? Math.round(lowest) : 0,
    };
  };

  const resultsStats = calculateResultsStats();

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
      suspended: { class: "badge-error", icon: FaTimesCircle, text: "Suspended" },
      deleted: { class: "badge-ghost", icon: FaTimesCircle, text: "Deleted" },
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

  // Loading state
  if (studentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60 animate-pulse">Loading student details...</p>
        </div>
      </div>
    );
  }

  // Student not found
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
        <FaExclamationTriangle className="text-6xl text-warning mb-4" />
        <h2 className="text-2xl font-bold text-base-content mb-2">Student Not Found</h2>
        <p className="text-base-content/60 mb-4">The student you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate("/dashboard/studentManagement/students")}
          className="btn btn-primary"
        >
          <FaArrowLeft className="mr-2" />
          Back to Students
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
            onClick={() => navigate("/dashboard/studentManagement/students")}
            className="btn btn-ghost btn-circle hover:bg-base-200 transition-all duration-300"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          <div className="flex items-center gap-4">
            <div className="avatar animate-scaleIn">
              <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                <img
                  src={student.image || defaultProfileImage}
                  alt={student.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.src = defaultProfileImage;
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">{student.name}</h1>
                {getStatusBadge(student.status)}
              </div>
              <div className="flex items-center gap-2 mt-1 text-base-content/60 text-sm">
                <FaIdCard />
                <span>Roll: {student.roll || "N/A"}</span>
                <span className="text-base-content/30">|</span>
                <span>ID: {student.studentId || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/dashboard/studentManagement/students")}
            className="btn btn-outline btn-sm lg:btn-md"
          >
            <FaArrowLeft className="mr-1" />
            Back
          </button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp" style={{ animationDelay: "0.1s" }}>
        {/* Attendance Card */}
        <div className="card bg-gradient-to-br from-success/10 to-success/5 border border-success/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60 uppercase tracking-wider">Attendance</p>
                <p className="text-2xl lg:text-3xl font-bold text-success">{attendanceStats.percentage}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <FaClipboardList className="text-xl text-success" />
              </div>
            </div>
            <div className="text-xs text-base-content/60 mt-2">
              {attendanceStats.present} / {attendanceStats.total} classes
            </div>
          </div>
        </div>

        {/* Fees Card */}
        <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60 uppercase tracking-wider">Fees Paid</p>
                <p className="text-2xl lg:text-3xl font-bold text-primary">{formatCurrency(feesStats.paid)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <FaMoneyBillWave className="text-xl text-primary" />
              </div>
            </div>
            <div className="text-xs text-base-content/60 mt-2">
              Due: {formatCurrency(feesStats.due)}
            </div>
          </div>
        </div>

        {/* Exams Card */}
        <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60 uppercase tracking-wider">Avg. Score</p>
                <p className="text-2xl lg:text-3xl font-bold text-secondary">{resultsStats.avgPercentage}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <FaChartLine className="text-xl text-secondary" />
              </div>
            </div>
            <div className="text-xs text-base-content/60 mt-2">
              {resultsStats.appeared} / {resultsStats.totalExams} exams
            </div>
          </div>
        </div>

        {/* Batch Card */}
        <div className="card bg-gradient-to-br from-info/10 to-info/5 border border-info/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-base-content/60 uppercase tracking-wider">Batch</p>
                <p className="text-lg lg:text-xl font-bold text-info truncate max-w-[120px]">{batch?.name || "N/A"}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center">
                <MdSchool className="text-xl text-info" />
              </div>
            </div>
            <div className="text-xs text-base-content/60 mt-2 truncate">
              {batch?.course || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Student Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="card bg-base-100 shadow border border-base-300 animate-slideUp" style={{ animationDelay: "0.2s" }}>
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MdPerson className="text-primary" />
                </div>
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InfoRow icon={FaUserGraduate} label="Full Name" value={student.name} iconColor="text-primary" />
                <InfoRow icon={FaVenusMars} label="Gender" value={student.gender || "N/A"} iconColor="text-secondary" />
                <InfoRow icon={FaBirthdayCake} label="Date of Birth" value={formatDate(student.dob)} iconColor="text-warning" />
                <InfoRow icon={FaPhone} label="Phone" value={student.phone || "N/A"} iconColor="text-success" />
                <InfoRow icon={FaEnvelope} label="Email" value={student.email || "N/A"} iconColor="text-info" />
                <InfoRow icon={FaMapMarkerAlt} label="Address" value={student.address || "N/A"} iconColor="text-error" />
              </div>
            </div>
          </div>

          {/* Guardian Information Card */}
          <div className="card bg-base-100 shadow border border-base-300 animate-slideUp" style={{ animationDelay: "0.3s" }}>
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <FaUserTie className="text-secondary" />
                </div>
                Guardian Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InfoRow icon={FaUserTie} label="Guardian Name" value={student.guardianName || "N/A"} iconColor="text-secondary" />
                <InfoRow icon={FaPhone} label="Guardian Phone" value={student.guardianPhone || "N/A"} iconColor="text-success" />
              </div>
            </div>
          </div>

          {/* Academic Information Card */}
          <div className="card bg-base-100 shadow border border-base-300 animate-slideUp" style={{ animationDelay: "0.4s" }}>
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                  <MdSchool className="text-info" />
                </div>
                Academic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InfoRow icon={MdSchool} label="Batch" value={batch?.name || "N/A"} iconColor="text-info" />
                <InfoRow icon={MdGroup} label="Course" value={batch?.course || "N/A"} iconColor="text-primary" />
                <InfoRow icon={FaIdCard} label="Roll Number" value={student.roll || "N/A"} iconColor="text-secondary" />
                <InfoRow icon={MdAccessTime} label="Schedule" value={batch?.schedule || "N/A"} iconColor="text-warning" />
                <InfoRow icon={FaSchool} label="Previous Institution" value={student.previousInstitute || "N/A"} iconColor="text-success" />
                <InfoRow icon={FaCalendarAlt} label="Admission Date" value={formatDate(student.admissionDate || student.createdAt)} iconColor="text-error" />
              </div>
            </div>
          </div>

          {/* Exam Results Table */}
          <div className="card bg-base-100 shadow border border-base-300 animate-slideUp" style={{ animationDelay: "0.5s" }}>
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <MdAssignment className="text-warning" />
                </div>
                Exam Results
                {resultsData && resultsData.length > 0 && (
                  <span className="badge badge-primary badge-sm">{resultsData.length}</span>
                )}
              </h2>

              {resultsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : resultsData && resultsData.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                  <table className="table table-zebra table-sm">
                    <thead>
                      <tr>
                        <th>Exam</th>
                        <th>Date</th>
                        <th>Marks</th>
                        <th>Percentage</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsData.map((result, index) => {
                        const exam = examsData?.find((e) => e._id === result.examId);
                        const percentage = exam?.totalMarks ? Math.round((result.marks / exam.totalMarks) * 100) : 0;
                        const grade = getGrade(percentage);

                        return (
                          <tr key={result._id} className="hover animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                            <td className="font-medium">{exam?.name || "Unknown Exam"}</td>
                            <td className="text-base-content/60">{formatDate(exam?.date)}</td>
                            <td>
                              {result.marks} / {exam?.totalMarks || "N/A"}
                            </td>
                            <td>
                              <span className={`font-medium ${percentage >= 80 ? "text-success" : percentage >= 60 ? "text-warning" : "text-error"}`}>
                                {percentage}%
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-sm ${grade.class}`}>{grade.letter}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/60">
                  <MdAssignment className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No exam results available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Attendance Summary Card */}
          <div className="card bg-base-100 shadow border border-base-300 animate-slideUp" style={{ animationDelay: "0.3s" }}>
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
                          strokeDasharray={`${attendanceStats.percentage * 3.52} 352`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{attendanceStats.percentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-success" />
                        <span>Present</span>
                      </div>
                      <span className="font-bold text-success">{attendanceStats.present}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-error/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaTimesCircle className="text-error" />
                        <span>Absent</span>
                      </div>
                      <span className="font-bold text-error">{attendanceStats.absent}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-warning" />
                        <span>Late</span>
                      </div>
                      <span className="font-bold text-warning">{attendanceStats.late}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Fees Summary Card */}
          <div className="card bg-base-100 shadow border border-base-300 animate-slideUp" style={{ animationDelay: "0.4s" }}>
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MdAttachMoney className="text-primary" />
                </div>
                Fees Summary
              </h2>

              {feesLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  <div className="stat px-0 py-2">
                    <div className="stat-title text-xs">Total Fees</div>
                    <div className="stat-value text-xl">{formatCurrency(feesStats.total)}</div>
                  </div>

                  <div className="divider my-0"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-base-content/60">Paid Amount</span>
                    <span className="font-bold text-success">{formatCurrency(feesStats.paid)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-base-content/60">Due Amount</span>
                    <span className="font-bold text-error">{formatCurrency(feesStats.due)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Payment Progress</span>
                      <span>{feesStats.total > 0 ? Math.round((feesStats.paid / feesStats.total) * 100) : 0}%</span>
                    </div>
                    <progress
                      className="progress progress-success w-full"
                      value={feesStats.paid}
                      max={feesStats.total || 1}
                    ></progress>
                  </div>

                  {/* Fee Status Badge */}
                  <div className="flex justify-center mt-4">
                    {feesStats.due > 0 ? (
                      <span className="badge badge-error gap-2">
                        <FaExclamationTriangle /> Payment Due
                      </span>
                    ) : feesStats.total > 0 ? (
                      <span className="badge badge-success gap-2">
                        <FaCheckCircle /> Fully Paid
                      </span>
                    ) : (
                      <span className="badge badge-ghost gap-2">
                        <FaClock /> No Fees Assigned
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Summary Card */}
          <div className="card bg-base-100 shadow border border-base-300 animate-slideUp" style={{ animationDelay: "0.5s" }}>
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <MdTrendingUp className="text-secondary" />
                </div>
                Performance
              </h2>

              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-lg">
                  <span className="text-sm">Exams Appeared</span>
                  <span className="font-bold">{resultsStats.appeared} / {resultsStats.totalExams}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-lg">
                  <span className="text-sm">Average Score</span>
                  <span className="font-bold text-primary">{resultsStats.avgPercentage}%</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                  <span className="text-sm">Highest Score</span>
                  <span className="font-bold text-success">{resultsStats.highest}%</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-error/10 rounded-lg">
                  <span className="text-sm">Lowest Score</span>
                  <span className="font-bold text-error">{resultsStats.lowest}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card bg-base-100 shadow border border-base-300 animate-slideUp" style={{ animationDelay: "0.6s" }}>
            <div className="card-body">
              <h2 className="card-title text-lg">Quick Actions</h2>
              <div className="space-y-2 mt-2">
                <button
                  onClick={() => navigate("/dashboard/studentManagement/students")}
                  className="btn btn-outline btn-sm w-full justify-start gap-2 hover:scale-[1.02] transition-transform"
                >
                  <FaArrowLeft />
                  Back to Students
                </button>
                <button
                  onClick={() => navigate("/dashboard/financeManagement/finances")}
                  className="btn btn-outline btn-sm w-full justify-start gap-2 hover:scale-[1.02] transition-transform"
                >
                  <FaMoneyBillWave />
                  View All Fees
                </button>
                <button
                  onClick={() => navigate("/dashboard/performanceManagement/examsResults")}
                  className="btn btn-outline btn-sm w-full justify-start gap-2 hover:scale-[1.02] transition-transform"
                >
                  <FaChartLine />
                  View All Results
                </button>
              </div>
            </div>
          </div>
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
      <p className="text-xs text-base-content/60 uppercase tracking-wider">{label}</p>
      <p className="font-medium text-base-content truncate">{value}</p>
    </div>
  </div>
);

// Grade helper function
const getGrade = (percentage) => {
  if (percentage >= 90) return { letter: "A+", class: "badge-success" };
  if (percentage >= 80) return { letter: "A", class: "badge-success" };
  if (percentage >= 70) return { letter: "B+", class: "badge-info" };
  if (percentage >= 60) return { letter: "B", class: "badge-info" };
  if (percentage >= 50) return { letter: "C", class: "badge-warning" };
  if (percentage >= 40) return { letter: "D", class: "badge-warning" };
  return { letter: "F", class: "badge-error" };
};

export default StudentDetails;
