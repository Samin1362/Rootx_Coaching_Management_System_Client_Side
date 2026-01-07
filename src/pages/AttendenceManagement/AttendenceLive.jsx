import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  MdCalendarToday,
  MdSchool,
  MdPerson,
  MdPhone,
  MdCheckCircle,
  MdCancel,
  MdExpandMore,
  MdExpandLess,
  MdSave,
} from "react-icons/md";
import {
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";
import { BiSolidCalendarCheck } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";

const AttendenceLive = () => {
  const axiosSecure = useAxiosSecure();
  const notification = useNotification();
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState({});
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

  // Fetch active batches
  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["activeBatches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches?status=active");
      return res.data;
    },
  });

  // Fetch all students and filter by batchId
  const { data: allStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data;
    },
  });

  // Filter students by selected batch
  const students = selectedBatchId
    ? allStudents.filter((student) => student.batchId === selectedBatchId)
    : [];

  // Mutation for submitting attendance
  const attendanceMutation = useMutation({
    mutationFn: async (attendanceData) => {
      const res = await axiosSecure.post("/attendences", attendanceData);
      return res.data;
    },
    onSuccess: (data) => {
      notification.success(data.message || "Attendance recorded successfully!");
      // Reset form
      setAttendance({});
      setSelectedBatchId("");
      setSelectedDate(new Date().toISOString().split("T")[0]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to record attendance";
      notification.error(errorMessage, "Error");
    },
  });

  // Handle attendance status toggle
  const handleAttendanceToggle = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    notMarked: students.length - Object.keys(attendance).length,
  };

  // Handle submit
  const handleSubmit = () => {
    // Validation
    if (!selectedBatchId) {
      notification.warning("Please select a batch", "Missing Information");
      return;
    }

    if (!selectedDate) {
      notification.warning("Please select a date", "Missing Information");
      return;
    }

    if (students.length === 0) {
      notification.warning("No students found in the selected batch", "No Students");
      return;
    }

    // Build records array
    const records = students.map((student) => ({
      studentId: student._id,
      status: attendance[student._id] || "absent", // Default to absent if not marked
    }));

    // Confirmation
    const unmarkedCount = students.length - Object.keys(attendance).length;
    if (unmarkedCount > 0) {
      const confirmed = window.confirm(
        `${unmarkedCount} student(s) are not marked and will be marked as absent. Continue?`
      );
      if (!confirmed) return;
    }

    // Prepare data
    const attendanceData = {
      date: selectedDate,
      batchId: selectedBatchId,
      records,
      takenBy: "admin", // Replace with logged-in user later
    };

    // Submit
    attendanceMutation.mutate(attendanceData);
  };

  if (batchesLoading) {
    return <Loader message="Loading batches..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-base-200 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-success to-primary rounded-xl flex items-center justify-center shadow-lg">
                <BiSolidCalendarCheck className="text-white text-xl" />
              </div>
              Live Attendance
            </h1>
            <p className="text-base-content/60 mt-2 ml-15">
              Take batch-wise attendance for students
            </p>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Batch Selection */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Select Batch
              <span className="text-error ml-1">*</span>
            </label>
            <div className="relative">
              <MdSchool className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
              <select
                value={selectedBatchId}
                onChange={(e) => {
                  const newBatchId = e.target.value;
                  setSelectedBatchId(newBatchId);
                  setAttendance({});
                  setMobileExpandedRows(new Set());
                }}
                className="select select-bordered w-full pl-10 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Choose a batch</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} - {batch.course} ({batch.schedule})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Select Date
              <span className="text-error ml-1">*</span>
            </label>
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input input-bordered w-full pl-10 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {selectedBatchId && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="stats shadow-md bg-base-100 border border-base-300">
            <div className="stat py-4 px-6">
              <div className="stat-figure text-primary">
                <FaUsers className="text-3xl" />
              </div>
              <div className="stat-title text-xs">Total Students</div>
              <div className="stat-value text-2xl text-primary">
                {stats.totalStudents}
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
                {stats.present}
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
                {stats.absent}
              </div>
            </div>
          </div>

          {/* Not Marked */}
          <div className="stats shadow-md bg-base-100 border border-base-300">
            <div className="stat py-4 px-6">
              <div className="stat-figure text-warning">
                <FaCalendarAlt className="text-3xl" />
              </div>
              <div className="stat-title text-xs">Not Marked</div>
              <div className="stat-value text-2xl text-warning">
                {stats.notMarked}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table Section */}
      {selectedBatchId && (
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
          {studentsLoading ? (
            <div className="py-12">
              <Loader size="sm" fullScreen={false} message="Loading students..." />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <FaUsers className="text-5xl text-base-content/20" />
                <p className="text-lg font-semibold text-base-content/60">
                  No students found
                </p>
                <p className="text-sm text-base-content/40">
                  This batch has no enrolled students
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
                      <th className="text-base-content font-semibold">
                        Student
                      </th>
                      <th className="text-base-content font-semibold">Phone</th>
                      <th className="text-base-content font-semibold text-center">
                        Attendance Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr
                        key={student._id}
                        className="hover:bg-base-200/50 transition-colors"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Student Info */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                              <MdPerson className="text-primary text-lg" />
                            </div>
                            <div>
                              <div className="font-semibold text-base-content">
                                {student.name}
                              </div>
                              <div className="text-xs text-base-content/60">
                                ID: {student._id?.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <MdPhone className="text-base-content/40" />
                            <span className="text-base-content">
                              {student.phone}
                            </span>
                          </div>
                        </td>

                        {/* Attendance Toggle */}
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleAttendanceToggle(student._id, "present")
                              }
                              className={`btn btn-sm ${
                                attendance[student._id] === "present"
                                  ? "btn-success text-white"
                                  : "btn-outline btn-success"
                              }`}
                            >
                              <MdCheckCircle className="text-lg" />
                              Present
                            </button>
                            <button
                              onClick={() =>
                                handleAttendanceToggle(student._id, "absent")
                              }
                              className={`btn btn-sm ${
                                attendance[student._id] === "absent"
                                  ? "btn-error text-white"
                                  : "btn-outline btn-error"
                              }`}
                            >
                              <MdCancel className="text-lg" />
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Accordion View */}
              <div className="md:hidden">
                {students.map((student, index) => {
                  const isExpanded = mobileExpandedRows.has(student._id);
                  const status = attendance[student._id];

                  return (
                    <div
                      key={student._id}
                      className="border-b border-base-300 last:border-b-0 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Collapsed Row */}
                      <div
                        className="p-4 hover:bg-base-200 transition-colors cursor-pointer"
                        onClick={() => toggleMobileRowExpansion(student._id)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Left: Student Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-10 h-10 bg-linear-to-br ${
                                status === "present"
                                  ? "from-success to-primary"
                                  : status === "absent"
                                  ? "from-error to-red-600"
                                  : "from-warning to-orange-500"
                              } rounded-xl flex items-center justify-center shadow-sm shrink-0`}
                            >
                              <MdPerson className="text-white text-lg" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base-content truncate">
                                {student.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                {status === "present" ? (
                                  <span className="badge badge-success badge-sm">
                                    <FaCheckCircle className="text-xs mr-1" />
                                    Present
                                  </span>
                                ) : status === "absent" ? (
                                  <span className="badge badge-error badge-sm">
                                    <FaTimesCircle className="text-xs mr-1" />
                                    Absent
                                  </span>
                                ) : (
                                  <span className="badge badge-warning badge-sm">
                                    Not Marked
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
                              {student.phone}
                            </span>
                          </div>

                          {/* Student ID */}
                          <div className="flex items-center gap-2 text-sm">
                            <MdPerson className="text-primary shrink-0" />
                            <span className="text-base-content/70">
                              ID: {student._id?.slice(-6)}
                            </span>
                          </div>

                          {/* Attendance Toggle Buttons */}
                          <div className="pt-3 flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleAttendanceToggle(student._id, "present")
                              }
                              className={`btn btn-sm flex-1 ${
                                attendance[student._id] === "present"
                                  ? "btn-success text-white"
                                  : "btn-outline btn-success"
                              }`}
                            >
                              <MdCheckCircle className="text-lg" />
                              Present
                            </button>
                            <button
                              onClick={() =>
                                handleAttendanceToggle(student._id, "absent")
                              }
                              className={`btn btn-sm flex-1 ${
                                attendance[student._id] === "absent"
                                  ? "btn-error text-white"
                                  : "btn-outline btn-error"
                              }`}
                            >
                              <MdCancel className="text-lg" />
                              Absent
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div className="p-6 bg-base-200/50 border-t border-base-300">
                <button
                  onClick={handleSubmit}
                  disabled={
                    !selectedBatchId ||
                    students.length === 0 ||
                    attendanceMutation.isPending
                  }
                  className="btn btn-primary btn-lg w-full text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {attendanceMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MdSave className="text-xl" />
                      Submit Attendance
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* No Batch Selected Message */}
      {!selectedBatchId && (
        <div className="bg-info/10 border border-info/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center shrink-0">
              <FaUserCheck className="text-info text-xl" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-base-content mb-1">
                Getting Started
              </h4>
              <p className="text-sm text-base-content/60">
                Select a batch and date to start taking attendance. All students
                enrolled in the selected batch will be displayed in the table
                below.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendenceLive;
