import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdCalendarToday,
  MdCheckCircle,
  MdCancel,
  MdPerson,
  MdClose,
} from "react-icons/md";
import {
  FaUserCheck,
  FaUsers,
  FaClipboardCheck,
  FaCalendarAlt,
} from "react-icons/fa";
import { BiSolidUserCheck, BiSolidUserX } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Attendences = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const hasInitializedRecords = useRef(false);

  const [showTakeAttendance, setShowTakeAttendance] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Filters for viewing attendance
  const [filterBatchId, setFilterBatchId] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Fetch batches
  const { data: batches = [] } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data;
    },
  });

  // Fetch students for selected batch
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students-for-batch", selectedBatch?._id],
    queryFn: async () => {
      if (!selectedBatch) return [];
      const res = await axiosSecure.get("/students");
      const allStudents = res.data;
      // Filter students by selected batch
      return allStudents.filter((s) => s.batchId === selectedBatch._id);
    },
    enabled: !!selectedBatch,
  });

  // Fetch attendance records
  const { data: attendanceHistory = [], isLoading: isLoadingHistory } =
    useQuery({
      queryKey: ["attendances", filterBatchId, filterDate],
      queryFn: async () => {
        let url = "/attendences?";
        if (filterBatchId) url += `batchId=${filterBatchId}&`;
        if (filterDate) url += `date=${filterDate}&`;
        const res = await axiosSecure.get(url);
        return res.data;
      },
    });

  // Submit attendance mutation
  const submitAttendanceMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosSecure.post("/attendences", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["attendances"]);
      alert("Attendance recorded successfully!");
      handleCloseModal();
    },
    onError: (error) => {
      alert(
        error.response?.data?.message ||
          "Failed to record attendance. Please try again."
      );
    },
  });

  // Initialize attendance records when students change
  useEffect(() => {
    if (students.length > 0 && !hasInitializedRecords.current) {
      hasInitializedRecords.current = true;
      // Use setTimeout to defer state update and avoid cascading renders
      setTimeout(() => {
        const initialRecords = {};
        students.forEach((student) => {
          initialRecords[student._id] = "present"; // Default to present
        });
        setAttendanceRecords(initialRecords);
      }, 0);
    }
  }, [students]);

  // Handle batch selection for taking attendance
  const handleSelectBatch = (batch) => {
    setSelectedBatch(batch);
    setShowTakeAttendance(true);
    setAttendanceRecords({});
    hasInitializedRecords.current = false;
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowTakeAttendance(false);
    setSelectedBatch(null);
    setAttendanceRecords({});
    hasInitializedRecords.current = false;
  };

  // Toggle student attendance status
  const toggleAttendance = (studentId) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
  };

  // Mark all as present
  const markAllPresent = () => {
    const allPresent = {};
    students.forEach((student) => {
      allPresent[student._id] = "present";
    });
    setAttendanceRecords(allPresent);
  };

  // Mark all as absent
  const markAllAbsent = () => {
    const allAbsent = {};
    students.forEach((student) => {
      allAbsent[student._id] = "absent";
    });
    setAttendanceRecords(allAbsent);
  };

  // Submit attendance
  const handleSubmitAttendance = () => {
    if (!selectedBatch || !selectedDate) {
      alert("Please select a batch and date");
      return;
    }

    if (students.length === 0) {
      alert("No students found in this batch");
      return;
    }

    const records = students.map((student) => ({
      studentId: student._id,
      status: attendanceRecords[student._id] || "present",
    }));

    submitAttendanceMutation.mutate({
      date: selectedDate,
      batchId: selectedBatch._id,
      records,
      takenBy: "admin", // Replace with actual logged-in user
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRecords = attendanceHistory.length;
    const totalPresent = attendanceHistory.reduce((sum, record) => {
      return sum + record.records.filter((r) => r.status === "present").length;
    }, 0);
    const totalAbsent = attendanceHistory.reduce((sum, record) => {
      return sum + record.records.filter((r) => r.status === "absent").length;
    }, 0);

    return {
      totalRecords,
      totalPresent,
      totalAbsent,
      attendanceRate:
        totalPresent + totalAbsent > 0
          ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(1)
          : 0,
    };
  }, [attendanceHistory]);

  // Get batch name by ID
  const getBatchName = (batchId) => {
    const batch = batches.find((b) => b._id === batchId);
    return batch?.name || "Unknown Batch";
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-base-200 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <FaClipboardCheck className="text-white text-xl" />
              </div>
              Attendance Management
            </h1>
            <p className="text-base-content/60 mt-2 ml-15">
              Take and manage student attendance records
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-primary">
              <FaCalendarAlt className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Records</div>
            <div className="stat-value text-2xl text-primary">
              {stats.totalRecords}
            </div>
            <div className="stat-desc text-xs">Attendance sessions</div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-success">
              <BiSolidUserCheck className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Present</div>
            <div className="stat-value text-2xl text-success">
              {stats.totalPresent}
            </div>
            <div className="stat-desc text-xs">Students marked present</div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-error">
              <BiSolidUserX className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Absent</div>
            <div className="stat-value text-2xl text-error">
              {stats.totalAbsent}
            </div>
            <div className="stat-desc text-xs">Students marked absent</div>
          </div>
        </div>

        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-info">
              <FaUserCheck className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Attendance Rate</div>
            <div className="stat-value text-2xl text-info">
              {stats.attendanceRate}%
            </div>
            <div className="stat-desc text-xs">Overall attendance</div>
          </div>
        </div>
      </div>

      {/* Take Attendance Section */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
          <FaClipboardCheck className="text-primary" />
          Take Attendance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <button
              key={batch._id}
              onClick={() => handleSelectBatch(batch)}
              className="p-4 border-2 border-base-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FaUsers className="text-primary text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors">
                    {batch.name}
                  </h3>
                  <p className="text-xs text-base-content/60 mt-1">
                    {batch.course}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {batch.schedule}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {batches.length === 0 && (
          <div className="text-center py-8 text-base-content/60">
            <FaUsers className="text-5xl mx-auto mb-3 opacity-20" />
            <p>No batches available</p>
          </div>
        )}
      </div>

      {/* Attendance History Section */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
          <MdCalendarToday className="text-primary" />
          Attendance History
        </h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Filter by Batch
            </label>
            <select
              className="select select-bordered w-full bg-base-100"
              value={filterBatchId}
              onChange={(e) => setFilterBatchId(e.target.value)}
            >
              <option value="">All Batches</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              className="input input-bordered w-full bg-base-100"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        {/* Attendance Records */}
        {isLoadingHistory ? (
          <div className="text-center py-8">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-base-content/60 mt-2">Loading records...</p>
          </div>
        ) : attendanceHistory.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            <FaCalendarAlt className="text-5xl mx-auto mb-3 opacity-20" />
            <p>No attendance records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendanceHistory.map((record) => {
              const presentCount = record.records.filter(
                (r) => r.status === "present"
              ).length;
              const absentCount = record.records.filter(
                (r) => r.status === "absent"
              ).length;
              const totalStudents = record.records.length;
              const attendancePercentage = (
                (presentCount / totalStudents) *
                100
              ).toFixed(1);

              return (
                <div
                  key={record._id}
                  className="border border-base-300 rounded-xl p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FaUsers className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base-content">
                            {getBatchName(record.batchId)}
                          </h3>
                          <p className="text-xs text-base-content/60">
                            {new Date(record.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-2">
                          <BiSolidUserCheck className="text-success text-xl" />
                          <span className="text-2xl font-bold text-success">
                            {presentCount}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/60">Present</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-2">
                          <BiSolidUserX className="text-error text-xl" />
                          <span className="text-2xl font-bold text-error">
                            {absentCount}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/60">Absent</p>
                      </div>

                      <div className="text-center">
                        <div
                          className="radial-progress text-primary"
                          style={{
                            "--value": attendancePercentage,
                            "--size": "4rem",
                          }}
                        >
                          {attendancePercentage}%
                        </div>
                        <p className="text-xs text-base-content/60 mt-1">
                          Rate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Take Attendance Modal */}
      {showTakeAttendance && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <button
              onClick={handleCloseModal}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <MdClose className="text-lg" />
            </button>

            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FaClipboardCheck className="text-primary" />
              Take Attendance - {selectedBatch?.name}
            </h3>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-base-content mb-2">
                Attendance Date
              </label>
              <input
                type="date"
                className="input input-bordered w-full bg-base-100"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={markAllPresent}
                className="btn btn-sm btn-success text-white"
              >
                <MdCheckCircle />
                Mark All Present
              </button>
              <button
                onClick={markAllAbsent}
                className="btn btn-sm btn-error text-white"
              >
                <MdCancel />
                Mark All Absent
              </button>
            </div>

            {/* Student List */}
            {isLoadingStudents ? (
              <div className="text-center py-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-base-content/60 mt-2">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                <MdPerson className="text-5xl mx-auto mb-3 opacity-20" />
                <p>No students found in this batch</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                      attendanceRecords[student._id] === "present"
                        ? "border-success bg-success/10"
                        : "border-error bg-error/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          attendanceRecords[student._id] === "present"
                            ? "bg-success/20"
                            : "bg-error/20"
                        }`}
                      >
                        {attendanceRecords[student._id] === "present" ? (
                          <BiSolidUserCheck className="text-success text-xl" />
                        ) : (
                          <BiSolidUserX className="text-error text-xl" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-base-content">
                          {student.name}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {student.phone}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleAttendance(student._id)}
                      className={`btn btn-sm ${
                        attendanceRecords[student._id] === "present"
                          ? "btn-success"
                          : "btn-error"
                      } text-white`}
                    >
                      {attendanceRecords[student._id] === "present"
                        ? "Present"
                        : "Absent"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {students.length > 0 && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {
                        Object.values(attendanceRecords).filter(
                          (s) => s === "present"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-base-content/60">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-error">
                      {
                        Object.values(attendanceRecords).filter(
                          (s) => s === "absent"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-base-content/60">Absent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {students.length}
                    </p>
                    <p className="text-xs text-base-content/60">Total</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="modal-action">
              <button onClick={handleCloseModal} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleSubmitAttendance}
                disabled={
                  submitAttendanceMutation.isPending || students.length === 0
                }
                className="btn btn-primary text-white"
              >
                {submitAttendanceMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaClipboardCheck />
                    Submit Attendance
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
        </div>
      )}
    </div>
  );
};

export default Attendences;
