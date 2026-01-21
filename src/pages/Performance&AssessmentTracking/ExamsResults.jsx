import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdFilterList,
  MdSchool,
  MdPerson,
  MdGrade,
  MdCalendarToday,
  MdExpandMore,
  MdExpandLess,
  MdSearch,
  MdSave,
} from "react-icons/md";
import {
  FaTrophy,
  FaChartLine,
  FaAward,
  FaCheckCircle,
  FaUsers,
  FaBookOpen,
} from "react-icons/fa";
import { BiSolidMedal } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";

const ExamsResults = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const notification = useNotification();

  // Form batch and exam selection
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");

  // Student results input state
  const [studentResults, setStudentResults] = useState({});

  // Filter states (for viewing results)
  const [filterExamId, setFilterExamId] = useState("");
  const [filterStudentId, setFilterStudentId] = useState("");
  const [mobileExpandedRows, setMobileExpandedRows] = useState(new Set());

  // Reset student results when batch or exam changes
  useEffect(() => {
    // This is intentional - reset form state when batch/exam changes
  }, [selectedBatchId, selectedExamId]);

  // Handle student result input change
  const handleResultChange = (studentId, field, value) => {
    setStudentResults((prev) => {
      const newResults = { ...prev };
      if (!newResults[studentId]) {
        newResults[studentId] = { marks: "", grade: "" };
      }
      newResults[studentId][field] = value;

      return newResults;
    });
  };

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
      return res.data?.data || [];
    },
  });

  // Get selected batch info
  const selectedBatch = useMemo(() => {
    return batches.find((b) => b._id === selectedBatchId);
  }, [batches, selectedBatchId]);

  // Fetch exams for selected batch (dependent query)
  const { data: batchExams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["batchExams", selectedBatchId],
    queryFn: async () => {
      if (!selectedBatchId) return [];
      const res = await axiosSecure.get(`/exams?batchId=${selectedBatchId}`);
      return res.data?.data || [];
    },
    enabled: !!selectedBatchId,
  });

  // Fetch students for selected batch (dependent query)
  const { data: batchStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["batchStudents", selectedBatchId],
    queryFn: async () => {
      if (!selectedBatchId) return [];
      const res = await axiosSecure.get("/students");
      const allStudents = res.data?.data || [];
      return allStudents.filter((s) => s.batchId === selectedBatchId);
    },
    enabled: !!selectedBatchId,
  });

  // Fetch all exams (for display purposes)
  const { data: allExams = [] } = useQuery({
    queryKey: ["allExams"],
    queryFn: async () => {
      const res = await axiosSecure.get("/exams");
      return res.data?.data || [];
    },
  });

  // Fetch all students (for display purposes)
  const { data: allStudents = [] } = useQuery({
    queryKey: ["allStudents"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data?.data || [];
    },
  });

  // Fetch all batches (for display purposes)
  const { data: allBatches = [] } = useQuery({
    queryKey: ["allBatches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data?.data || [];
    },
  });

  // Get selected exam info
  const selectedExam = useMemo(() => {
    return allExams.find((e) => e._id === selectedExamId);
  }, [allExams, selectedExamId]);

  // Fetch results
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["results", filterExamId, filterStudentId],
    queryFn: async () => {
      let url = "/results?";
      if (filterExamId) url += `examId=${filterExamId}&`;
      if (filterStudentId) url += `studentId=${filterStudentId}&`;
      const res = await axiosSecure.get(url);
      return res.data?.data || [];
    },
  });

  // Create bulk results mutation
  const createBulkResultsMutation = useMutation({
    mutationFn: async (resultsArray) => {
      // Submit all results one by one
      const promises = resultsArray.map((resultData) =>
        axiosSecure.post("/results", resultData)
      );
      return await Promise.allSettled(promises);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries(["results"]);

      const successCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;
      const failCount = results.filter((r) => r.status === "rejected").length;

      if (failCount === 0) {
        notification.success(
          `Successfully added ${successCount} results!`,
          "Success"
        );
      } else {
        notification.warning(
          `Added ${successCount} results successfully. ${failCount} failed (possibly duplicates).`,
          "Partial Success"
        );
      }

      // Reset form
      setStudentResults({});
      setSelectedBatchId("");
      setSelectedExamId("");
    },
    onError: () => {
      notification.error(
        "Failed to submit results. Please try again.",
        "Error"
      );
    },
  });

  // Helper functions
  const getExamInfo = (examId) => {
    const exam = allExams.find((e) => e._id === examId);
    return exam || null;
  };

  const getStudentInfo = (studentId) => {
    const student = allStudents.find((s) => s._id === studentId);
    return student || null;
  };

  const getBatchInfo = (batchId) => {
    const batch = allBatches.find((b) => b._id === batchId);
    if (batch) {
      return `${batch.name} - ${batch.course}`;
    }
    return "Unknown Batch";
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalResults = results.length;
    const totalMarks = results.reduce((sum, r) => sum + (r.marks || 0), 0);
    const avgMarks =
      totalResults > 0 ? (totalMarks / totalResults).toFixed(2) : 0;
    const passCount = results.filter((r) => r.marks >= 40).length;
    const passRate =
      totalResults > 0 ? ((passCount / totalResults) * 100).toFixed(1) : 0;

    return {
      totalResults,
      avgMarks,
      passCount,
      passRate,
    };
  }, [results]);

  // Handle bulk submit
  const handleBulkSubmit = () => {
    if (!selectedBatchId || !selectedExamId) {
      notification.warning(
        "Please select both Batch and Exam first!",
        "Missing Selection"
      );
      return;
    }

    if (!selectedExam) {
      notification.error("Selected exam not found!", "Error");
      return;
    }

    // Collect all results that have marks entered
    const resultsToSubmit = [];
    let hasInvalidMarks = false;

    Object.entries(studentResults).forEach(([studentId, result]) => {
      if (result.marks && Number(result.marks) >= 0) {
        // Validation
        if (Number(result.marks) > selectedExam.totalMarks) {
          hasInvalidMarks = true;
          return;
        }

        resultsToSubmit.push({
          examId: selectedExamId,
          studentId,
          marks: Number(result.marks),
          grade: result.grade || "",
        });
      }
    });

    if (hasInvalidMarks) {
      notification.warning(
        `Marks for some students exceed total marks (${selectedExam.totalMarks})`,
        "Invalid Marks"
      );
      return;
    }

    if (resultsToSubmit.length === 0) {
      notification.warning(
        "Please enter marks for at least one student!",
        "No Data"
      );
      return;
    }

    // Submit results directly
    createBulkResultsMutation.mutate(resultsToSubmit);
  };

  if (isLoading) {
    return <Loader message="Loading results..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-base-200 rounded-2xl p-6 shadow-sm border border-base-300">
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-warning to-primary rounded-xl flex items-center justify-center shadow-lg">
              <FaTrophy className="text-white text-xl" />
            </div>
            Exam Results Management
          </h1>
          <p className="text-base-content/60 mt-2 ml-15">
            Add and manage student exam results
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Results */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-primary">
              <FaChartLine className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Results</div>
            <div className="stat-value text-2xl text-primary">
              {stats.totalResults}
            </div>
          </div>
        </div>

        {/* Average Marks */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-info">
              <BiSolidMedal className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Avg Marks</div>
            <div className="stat-value text-2xl text-info">
              {stats.avgMarks}
            </div>
          </div>
        </div>

        {/* Pass Count */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-success">
              <FaCheckCircle className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Passed</div>
            <div className="stat-value text-2xl text-success">
              {stats.passCount}
            </div>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-warning">
              <FaAward className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Pass Rate</div>
            <div className="stat-value text-2xl text-warning">
              {stats.passRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Add Result Form */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
          <FaAward className="text-primary" />
          Add Results for Batch
        </h2>

        <div>
          {/* Batch and Exam Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Batch Selection */}
            <div>
              <label className="block text-sm font-semibold text-base-content mb-2">
                Select Batch
                <span className="text-error ml-1">*</span>
              </label>
              <div className="relative">
                <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
                <select
                  value={selectedBatchId}
                  onChange={(e) => {
                    setSelectedBatchId(e.target.value);
                    setSelectedExamId("");
                  }}
                  className="select select-bordered w-full pl-10 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={batchesLoading}
                >
                  <option value="">
                    {batchesLoading ? "Loading batches..." : "Choose a batch"}
                  </option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} - {batch.course}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Course Display (Auto-derived) */}
            <div>
              <label className="block text-sm font-semibold text-base-content mb-2">
                Course
              </label>
              <div className="relative">
                <FaBookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
                <input
                  type="text"
                  value={selectedBatch?.course || ""}
                  disabled
                  placeholder="Select batch first"
                  className="input input-bordered w-full pl-10 bg-base-200 text-base-content/70"
                />
              </div>
            </div>

            {/* Exam Selection */}
            <div>
              <label className="block text-sm font-semibold text-base-content mb-2">
                Select Exam
                <span className="text-error ml-1">*</span>
              </label>
              <div className="relative">
                <MdSchool className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="select select-bordered w-full pl-10 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={!selectedBatchId || examsLoading}
                >
                  <option value="">
                    {!selectedBatchId
                      ? "Select batch first"
                      : examsLoading
                      ? "Loading exams..."
                      : batchExams.length === 0
                      ? "No exams available"
                      : "Choose an exam"}
                  </option>
                  {batchExams.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.name} ({exam.totalMarks} marks) -{" "}
                      {new Date(exam.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Students Table */}
          {selectedBatchId && selectedExamId && (
            <>
              {studentsLoading ? (
                <div className="py-8">
                  <Loader
                    size="sm"
                    fullScreen={false}
                    message="Loading students..."
                  />
                </div>
              ) : batchStudents.length === 0 ? (
                <div className="text-center py-8">
                  <FaUsers className="text-6xl text-base-content/20 mx-auto mb-4" />
                  <p className="text-base-content/60">
                    No students found in this batch
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-info/10 rounded-lg border border-info/20">
                    <p className="text-sm text-base-content flex items-center gap-2 flex-wrap">
                      <MdSchool className="text-info shrink-0" />
                      <span>
                        <strong>
                          {allExams.find((e) => e._id === selectedExamId)?.name}
                        </strong>{" "}
                        - Total Marks:{" "}
                        <strong>
                          {
                            allExams.find((e) => e._id === selectedExamId)
                              ?.totalMarks
                          }
                        </strong>{" "}
                        | Students: <strong>{batchStudents.length}</strong>
                      </span>
                    </p>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr className="bg-base-200">
                          <th className="text-sm font-bold">#</th>
                          <th className="text-sm font-bold">Roll</th>
                          <th className="text-sm font-bold">Student Name</th>
                          <th className="text-sm font-bold">Phone</th>
                          <th className="text-sm font-bold">Marks Obtained</th>
                          <th className="text-sm font-bold">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchStudents.map((student, index) => (
                          <tr key={student._id} className="hover">
                            <td>{index + 1}</td>
                            <td>
                              <span className="badge badge-primary badge-sm font-bold">
                                {student.roll || "N/A"}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="avatar">
                                  <div className="mask mask-squircle w-10 h-10">
                                    <img
                                      src={
                                        student.image ||
                                        "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
                                      }
                                      alt={student.name}
                                    />
                                  </div>
                                </div>
                                <div className="font-semibold">
                                  {student.name}
                                </div>
                              </div>
                            </td>
                            <td className="text-sm text-base-content/70">
                              {student.phone}
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                max={
                                  allExams.find((e) => e._id === selectedExamId)
                                    ?.totalMarks
                                }
                                placeholder="0"
                                value={studentResults[student._id]?.marks || ""}
                                onChange={(e) =>
                                  handleResultChange(
                                    student._id,
                                    "marks",
                                    e.target.value
                                  )
                                }
                                className="input input-sm input-bordered w-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <span className="text-xs text-base-content/60 ml-2">
                                /{" "}
                                {
                                  allExams.find((e) => e._id === selectedExamId)
                                    ?.totalMarks
                                }
                              </span>
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="A+, A, B+"
                                value={studentResults[student._id]?.grade || ""}
                                onChange={(e) =>
                                  handleResultChange(
                                    student._id,
                                    "grade",
                                    e.target.value
                                  )
                                }
                                className="input input-sm input-bordered w-20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Accordion */}
                  <div className="md:hidden space-y-3">
                    {batchStudents.map((student) => (
                      <div
                        key={student._id}
                        className="bg-base-200 rounded-lg p-4 border border-base-300"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <img
                                src={
                                  student.image ||
                                  "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"
                                }
                                alt={student.name}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="badge badge-primary badge-sm font-bold">
                                #{student.roll || "N/A"}
                              </span>
                              <span className="font-semibold text-base-content">
                                {student.name}
                              </span>
                            </div>
                            <div className="text-xs text-base-content/60">
                              {student.phone}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Marks Input */}
                          <div>
                            <label className="block text-xs font-semibold text-base-content mb-1">
                              Marks Obtained
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max={
                                  allExams.find((e) => e._id === selectedExamId)
                                    ?.totalMarks
                                }
                                placeholder="0"
                                value={studentResults[student._id]?.marks || ""}
                                onChange={(e) =>
                                  handleResultChange(
                                    student._id,
                                    "marks",
                                    e.target.value
                                  )
                                }
                                className="input input-sm input-bordered flex-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <span className="text-xs text-base-content/60">
                                /{" "}
                                {
                                  allExams.find((e) => e._id === selectedExamId)
                                    ?.totalMarks
                                }
                              </span>
                            </div>
                          </div>

                          {/* Grade Input */}
                          <div>
                            <label className="block text-xs font-semibold text-base-content mb-1">
                              Grade
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., A+, A, B+, B, C"
                              value={studentResults[student._id]?.grade || ""}
                              onChange={(e) =>
                                handleResultChange(
                                  student._id,
                                  "grade",
                                  e.target.value
                                )
                              }
                              className="input input-sm input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleBulkSubmit}
                      className="btn btn-primary w-full md:w-auto px-8"
                      disabled={createBulkResultsMutation.isPending}
                    >
                      {createBulkResultsMutation.isPending ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Submitting Results...
                        </>
                      ) : (
                        <>
                          <MdSave className="text-lg" />
                          Submit All Results
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* No Selection State */}
          {!selectedBatchId && (
            <div className="text-center py-12">
              <FaUsers className="text-6xl text-base-content/20 mx-auto mb-4" />
              <p className="text-base-content/60 text-lg mb-2">
                Select a batch to get started
              </p>
              <p className="text-base-content/40 text-sm">
                Choose a batch and exam to enter results for all students
              </p>
            </div>
          )}

          {selectedBatchId && !selectedExamId && (
            <div className="text-center py-12">
              <MdSchool className="text-6xl text-base-content/20 mx-auto mb-4" />
              <p className="text-base-content/60 text-lg mb-2">
                Select an exam to continue
              </p>
              <p className="text-base-content/40 text-sm">
                Choose an exam to display students and enter their results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex items-center gap-2 mb-4">
          <MdFilterList className="text-primary text-xl" />
          <h2 className="text-lg font-semibold text-base-content">
            Filter Results
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exam Filter */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Filter by Exam
            </label>
            <select
              value={filterExamId}
              onChange={(e) => setFilterExamId(e.target.value)}
              className="select select-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Exams</option>
              {allExams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.name} - {getBatchInfo(exam.batchId)}
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-sm font-semibold text-base-content mb-2">
              Filter by Student
            </label>
            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="select select-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Students</option>
              {allStudents.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(filterExamId || filterStudentId) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-base-content/60">
              Active filters:
            </span>
            {filterExamId && (
              <div className="badge badge-primary gap-2">
                Exam: {getExamInfo(filterExamId)?.name}
                <button
                  onClick={() => setFilterExamId("")}
                  className="hover:text-primary-content/80"
                >
                  ×
                </button>
              </div>
            )}
            {filterStudentId && (
              <div className="badge badge-secondary gap-2">
                Student: {getStudentInfo(filterStudentId)?.name}
                <button
                  onClick={() => setFilterStudentId("")}
                  className="hover:text-secondary-content/80"
                >
                  ×
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setFilterExamId("");
                setFilterStudentId("");
              }}
              className="text-xs link link-error"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Table Section */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
        <div className="p-6 border-b border-base-300">
          <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
            <FaUsers className="text-primary" />
            Results ({results.length})
          </h3>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <FaTrophy className="text-5xl text-base-content/20" />
              <p className="text-lg font-semibold text-base-content/60">
                No results found
              </p>
              <p className="text-sm text-base-content/40">
                {filterExamId || filterStudentId
                  ? "Try adjusting your filters"
                  : "Add results using the form above"}
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
                    <th className="text-base-content font-semibold">Student</th>
                    <th className="text-base-content font-semibold">Exam</th>
                    <th className="text-base-content font-semibold text-center">
                      Marks
                    </th>
                    <th className="text-base-content font-semibold text-center">
                      Grade
                    </th>
                    <th className="text-base-content font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => {
                    const student = getStudentInfo(result.studentId);
                    const exam = getExamInfo(result.examId);

                    return (
                      <tr
                        key={result._id}
                        className="hover:bg-base-200/50 transition-colors"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Student */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                              <MdPerson className="text-primary text-lg" />
                            </div>
                            <div>
                              <div className="font-semibold text-base-content">
                                {student?.name || "Unknown Student"}
                              </div>
                              <div className="text-xs text-base-content/60">
                                {student?.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Exam */}
                        <td>
                          <div className="flex items-center gap-2">
                            <MdSchool className="text-secondary" />
                            <div>
                              <div className="font-medium">
                                {exam?.name || "Unknown Exam"}
                              </div>
                              <div className="text-xs text-base-content/60">
                                Total: {exam?.totalMarks} marks
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Marks */}
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <MdGrade
                              className={
                                result.marks >= 40
                                  ? "text-success"
                                  : "text-error"
                              }
                            />
                            <span
                              className={`font-semibold ${
                                result.marks >= 40
                                  ? "text-success"
                                  : "text-error"
                              }`}
                            >
                              {result.marks}
                              {exam?.totalMarks && `/${exam.totalMarks}`}
                            </span>
                          </div>
                        </td>

                        {/* Grade */}
                        <td className="text-center">
                          {result.grade ? (
                            <span className="badge badge-warning font-semibold">
                              {result.grade}
                            </span>
                          ) : (
                            <span className="text-base-content/40">-</span>
                          )}
                        </td>

                        {/* Date */}
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <MdCalendarToday className="text-base-content/40" />
                            <span className="text-base-content">
                              {new Date(result.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Accordion View */}
            <div className="md:hidden">
              {results.map((result, index) => {
                const isExpanded = mobileExpandedRows.has(result._id);
                const student = getStudentInfo(result.studentId);
                const exam = getExamInfo(result.examId);
                const isPassed = result.marks >= 40;

                return (
                  <div
                    key={result._id}
                    className="border-b border-base-300 last:border-b-0 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Collapsed Row */}
                    <div
                      className="p-4 hover:bg-base-200 transition-colors cursor-pointer"
                      onClick={() => toggleMobileRowExpansion(result._id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: Student Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-10 h-10 bg-linear-to-br ${
                              isPassed
                                ? "from-success to-primary"
                                : "from-error to-red-600"
                            } rounded-xl flex items-center justify-center shadow-sm shrink-0`}
                          >
                            <MdPerson className="text-white text-lg" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base-content truncate">
                              {student?.name || "Unknown Student"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`badge badge-sm ${
                                  isPassed ? "badge-success" : "badge-error"
                                }`}
                              >
                                {result.marks}
                                {exam?.totalMarks && `/${exam.totalMarks}`}
                              </span>
                              {result.grade && (
                                <span className="badge badge-warning badge-sm">
                                  {result.grade}
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
                        {/* Exam */}
                        <div className="flex items-center gap-2 text-sm">
                          <MdSchool className="text-primary shrink-0" />
                          <span className="text-base-content/70">
                            {exam?.name || "Unknown Exam"}
                          </span>
                        </div>

                        {/* Marks */}
                        <div className="flex items-center gap-2 text-sm">
                          <MdGrade
                            className={isPassed ? "text-success" : "text-error"}
                          />
                          <span className="text-base-content/70">
                            Marks: {result.marks}
                            {exam?.totalMarks && ` / ${exam.totalMarks}`}
                          </span>
                        </div>

                        {/* Grade */}
                        {result.grade && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaAward className="text-warning shrink-0" />
                            <span className="text-base-content/70">
                              Grade: {result.grade}
                            </span>
                          </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm">
                          <MdCalendarToday className="text-base-content/40 shrink-0" />
                          <span className="text-base-content/60">
                            {new Date(result.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamsResults;
