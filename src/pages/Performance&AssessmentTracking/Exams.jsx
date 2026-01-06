import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdSearch,
  MdFilterList,
  MdSchool,
  MdCalendarToday,
  MdClose,
  MdExpandMore,
  MdExpandLess,
  MdGrade,
  MdAdd,
} from "react-icons/md";
import {
  FaClipboardList,
  FaCheckCircle,
  FaCalendarAlt,
  FaBookOpen,
  FaTrash,
} from "react-icons/fa";
import { BiSolidBookBookmark } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Exams = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterBatchId, setFilterBatchId] = useState("");
  const [mobileExpandedRows, setMobileExpandedRows] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    batchId: "",
    totalMarks: "",
    date: new Date().toISOString().split("T")[0],
  });

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

  // Fetch exams
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["exams", filterBatchId, globalFilter],
    queryFn: async () => {
      let url = "/exams?";
      if (filterBatchId) url += `batchId=${filterBatchId}&`;
      if (globalFilter) url += `name=${globalFilter}&`;
      const res = await axiosSecure.get(url);
      return res.data;
    },
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: async (examData) => {
      const res = await axiosSecure.post("/exams", examData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["exams"]);
      alert("Exam created successfully!");
      handleCloseModal();
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to create exam");
    },
  });

  // Delete exam mutation
  const deleteExamMutation = useMutation({
    mutationFn: async (examId) => {
      const res = await axiosSecure.delete(`/exams?id=${examId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["exams"]);
      alert("Exam deleted successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to delete exam";
      alert(errorMessage);
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

  // Handle delete exam
  const handleDeleteExam = (exam) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${exam.name}"?\n\nNote: This exam cannot be deleted if results already exist for it.`
    );

    if (confirmDelete) {
      deleteExamMutation.mutate(exam._id);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalExams = exams.length;
    const upcomingExams = exams.filter(
      (exam) => new Date(exam.date) > new Date()
    ).length;
    const completedExams = exams.filter(
      (exam) => new Date(exam.date) <= new Date()
    ).length;
    const totalMarks = exams.reduce(
      (sum, exam) => sum + (exam.totalMarks || 0),
      0
    );

    return {
      totalExams,
      upcomingExams,
      completedExams,
      totalMarks,
    };
  }, [exams]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      name: "",
      batchId: "",
      totalMarks: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert("Please enter exam name");
      return;
    }
    if (!formData.batchId) {
      alert("Please select a batch");
      return;
    }
    if (!formData.totalMarks || formData.totalMarks <= 0) {
      alert("Please enter valid total marks");
      return;
    }
    if (!formData.date) {
      alert("Please select exam date");
      return;
    }

    createExamMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/60">Loading exams...</p>
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
              <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <FaClipboardList className="text-white text-xl" />
              </div>
              Exams Management
            </h1>
            <p className="text-base-content/60 mt-2 ml-15">
              Create and manage exams for all batches
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MdAdd className="text-xl" />
            Create New Exam
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Exams */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-primary">
              <FaClipboardList className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Total Exams</div>
            <div className="stat-value text-2xl text-primary">
              {stats.totalExams}
            </div>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-warning">
              <FaCalendarAlt className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Upcoming</div>
            <div className="stat-value text-2xl text-warning">
              {stats.upcomingExams}
            </div>
          </div>
        </div>

        {/* Completed Exams */}
        <div className="stats shadow-md bg-base-100 border border-base-300">
          <div className="stat py-4 px-6">
            <div className="stat-figure text-success">
              <FaCheckCircle className="text-3xl" />
            </div>
            <div className="stat-title text-xs">Completed</div>
            <div className="stat-value text-2xl text-success">
              {stats.completedExams}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-base-content/40" />
              <input
                type="text"
                placeholder="Search exams by name..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="input input-bordered w-full pl-12 pr-4 bg-base-200 focus:bg-base-100 transition-all duration-200"
              />
            </div>
          </div>

          {/* Batch Filter */}
          <div className="flex items-center gap-2 min-w-64">
            <MdFilterList className="text-xl text-base-content/40" />
            <select
              value={filterBatchId}
              onChange={(e) => setFilterBatchId(e.target.value)}
              className="select select-bordered bg-base-200 focus:bg-base-100 flex-1"
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

        {/* Active Filters Display */}
        {(filterBatchId || globalFilter) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-base-content/60">
              Active filters:
            </span>
            {globalFilter && (
              <div className="badge badge-primary gap-2">
                Search: {globalFilter}
                <button
                  onClick={() => setGlobalFilter("")}
                  className="hover:text-primary-content/80"
                >
                  ×
                </button>
              </div>
            )}
            {filterBatchId && (
              <div className="badge badge-secondary gap-2">
                Batch: {getBatchInfo(filterBatchId)}
                <button
                  onClick={() => setFilterBatchId("")}
                  className="hover:text-secondary-content/80"
                >
                  ×
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setGlobalFilter("");
                setFilterBatchId("");
              }}
              className="text-xs link link-error"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Exams Table Section */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
        {exams.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-3">
              <FaClipboardList className="text-5xl text-base-content/20" />
              <p className="text-lg font-semibold text-base-content/60">
                No exams found
              </p>
              <p className="text-sm text-base-content/40">
                {filterBatchId || globalFilter
                  ? "Try adjusting your filters"
                  : "Create your first exam to get started"}
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
                      Exam Name
                    </th>
                    <th className="text-base-content font-semibold">Batch</th>
                    <th className="text-base-content font-semibold text-center">
                      Total Marks
                    </th>
                    <th className="text-base-content font-semibold">
                      Exam Date
                    </th>
                    <th className="text-base-content font-semibold text-center">
                      Status
                    </th>
                    <th className="text-base-content font-semibold text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam, index) => {
                    const examDate = new Date(exam.date);
                    const isUpcoming = examDate > new Date();

                    return (
                      <tr
                        key={exam._id}
                        className="hover:bg-base-200/50 transition-colors"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Exam Name */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                              <BiSolidBookBookmark className="text-primary text-lg" />
                            </div>
                            <div>
                              <div className="font-semibold text-base-content">
                                {exam.name}
                              </div>
                              <div className="text-xs text-base-content/60">
                                Created:{" "}
                                {new Date(exam.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Batch */}
                        <td>
                          <div className="flex items-center gap-2">
                            <MdSchool className="text-secondary" />
                            <span className="font-medium">
                              {getBatchInfo(exam.batchId)}
                            </span>
                          </div>
                        </td>

                        {/* Total Marks */}
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <MdGrade className="text-warning" />
                            <span className="font-semibold text-warning">
                              {exam.totalMarks}
                            </span>
                          </div>
                        </td>

                        {/* Exam Date */}
                        <td>
                          <div className="flex items-center gap-2">
                            <MdCalendarToday className="text-info" />
                            <div>
                              <div className="font-semibold text-sm">
                                {examDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                              <div className="text-xs text-base-content/60">
                                {examDate.toLocaleDateString("en-US", {
                                  weekday: "long",
                                })}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="text-center">
                          <span
                            className={`badge ${
                              isUpcoming ? "badge-warning" : "badge-success"
                            } font-semibold`}
                          >
                            {isUpcoming ? "Upcoming" : "Completed"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="text-center">
                          <button
                            onClick={() => handleDeleteExam(exam)}
                            className="btn btn-sm btn-error btn-outline"
                            disabled={deleteExamMutation.isPending}
                            title="Delete Exam"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Accordion View */}
            <div className="md:hidden">
              {exams.map((exam, index) => {
                const isExpanded = mobileExpandedRows.has(exam._id);
                const examDate = new Date(exam.date);
                const isUpcoming = examDate > new Date();

                return (
                  <div
                    key={exam._id}
                    className="border-b border-base-300 last:border-b-0 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Collapsed Row */}
                    <div
                      className="p-4 hover:bg-base-200 transition-colors cursor-pointer"
                      onClick={() => toggleMobileRowExpansion(exam._id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: Exam Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-10 h-10 bg-linear-to-br ${
                              isUpcoming
                                ? "from-warning to-orange-500"
                                : "from-success to-primary"
                            } rounded-xl flex items-center justify-center shadow-sm shrink-0`}
                          >
                            <FaBookOpen className="text-white text-lg" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base-content truncate">
                              {exam.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`badge badge-sm ${
                                  isUpcoming ? "badge-warning" : "badge-success"
                                }`}
                              >
                                {isUpcoming ? "Upcoming" : "Completed"}
                              </span>
                              <span className="text-xs text-base-content/60">
                                {exam.totalMarks} marks
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
                            {getBatchInfo(exam.batchId)}
                          </span>
                        </div>

                        {/* Total Marks */}
                        <div className="flex items-center gap-2 text-sm">
                          <MdGrade className="text-warning shrink-0" />
                          <span className="text-base-content/70">
                            Total Marks: {exam.totalMarks}
                          </span>
                        </div>

                        {/* Exam Date */}
                        <div className="flex items-center gap-2 text-sm">
                          <MdCalendarToday className="text-info shrink-0" />
                          <span className="text-base-content/70">
                            {examDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Created Date */}
                        <div className="flex items-center gap-2 text-sm">
                          <FaCalendarAlt className="text-base-content/40 shrink-0" />
                          <span className="text-base-content/60">
                            Created:{" "}
                            {new Date(exam.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExam(exam);
                            }}
                            className="btn btn-sm btn-error btn-outline flex-1"
                            disabled={deleteExamMutation.isPending}
                          >
                            <FaTrash />
                            Delete Exam
                          </button>
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

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <button
              onClick={handleCloseModal}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <MdClose className="text-lg" />
            </button>

            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <FaClipboardList className="text-primary" />
              Create New Exam
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Exam Name */}
                <div>
                  <label className="block text-sm font-semibold text-base-content mb-2">
                    Exam Name
                    <span className="text-error ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Mid Term Exam, Final Exam"
                    className="input input-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                {/* Batch Selection */}
                <div>
                  <label className="block text-sm font-semibold text-base-content mb-2">
                    Select Batch
                    <span className="text-error ml-1">*</span>
                  </label>
                  <div className="relative">
                    <MdSchool className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
                    <select
                      name="batchId"
                      value={formData.batchId}
                      onChange={handleInputChange}
                      className="select select-bordered w-full pl-10 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="">Choose a batch</option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.name} - {batch.course}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Total Marks */}
                <div>
                  <label className="block text-sm font-semibold text-base-content mb-2">
                    Total Marks
                    <span className="text-error ml-1">*</span>
                  </label>
                  <div className="relative">
                    <MdGrade className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
                    <input
                      type="number"
                      name="totalMarks"
                      value={formData.totalMarks}
                      onChange={handleInputChange}
                      placeholder="e.g., 100"
                      min="1"
                      className="input input-bordered w-full pl-10 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                {/* Exam Date */}
                <div>
                  <label className="block text-sm font-semibold text-base-content mb-2">
                    Exam Date
                    <span className="text-error ml-1">*</span>
                  </label>
                  <div className="relative">
                    <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="input input-bordered w-full pl-10 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="modal-action">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createExamMutation.isPending}
                  className="btn btn-primary text-white"
                >
                  {createExamMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Create Exam
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
        </div>
      )}
    </div>
  );
};

export default Exams;
