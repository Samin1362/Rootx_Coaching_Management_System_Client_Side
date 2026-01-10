import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  MdPhone,
  MdPerson,
  MdCalendarToday,
  MdEdit,
  MdClose,
  MdCheck,
  MdSearch,
  MdFilterList,
  MdExpandMore,
  MdExpandLess,
  MdDelete,
  MdWarning,
} from "react-icons/md";
import {
  FaCommentDots,
  FaUserPlus,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaBan,
} from "react-icons/fa";
import { BiSolidPhoneCall } from "react-icons/bi";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";

const AdmissionFollowUps = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const notification = useNotification();

  const [activeId, setActiveId] = useState(null);
  const [followUpDate, setFollowUpDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedFollowUps, setExpandedFollowUps] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [followUpToDelete, setFollowUpToDelete] = useState(null);

  const {
    register,
    handleSubmit: handleFormSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  // Fetch admissions
  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ["admissions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admissions");
      return res.data;
    },
  });

  // Patch follow-up
  const followUpMutation = useMutation({
    mutationFn: async ({ id, followUpNote, followUpDate }) => {
      return axiosSecure.patch(`/admissions/${id}`, {
        followUpNote,
        followUpDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admissions"]);
      setActiveId(null);
      setFollowUpDate(null);
      reset();
      notification.success("Follow-up added successfully!");
    },
    onError: () => {
      notification.error("Failed to add follow-up. Please try again.", "Error");
    },
  });

  // Delete follow-up mutation
  const deleteFollowUpMutation = useMutation({
    mutationFn: async ({ admissionId, followUpIndex }) => {
      // Get the current admission data
      const admission = admissions.find((a) => a._id === admissionId);
      if (!admission) throw new Error("Admission not found");

      // Create a new followUps array without the deleted item
      const updatedFollowUps = admission.followUps.filter(
        (_, index) => index !== followUpIndex
      );

      // Send the updated followUps array to the backend
      return axiosSecure.patch(`/admissions/${admissionId}`, {
        followUps: updatedFollowUps,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admissions"]);
      setDeleteModalOpen(false);
      setFollowUpToDelete(null);
      notification.success("Follow-up deleted successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete follow-up. Please try again.";
      notification.error(errorMessage, "Delete Failed");
    },
  });

  const handleSubmit = (data) => {
    followUpMutation.mutate({
      id: activeId,
      followUpNote: data.note,
      followUpDate: data.date,
    });
  };

  const toggleFollowUps = (admissionId) => {
    setExpandedFollowUps((prev) => ({
      ...prev,
      [admissionId]: !prev[admissionId],
    }));
  };

  // Handle delete follow-up click
  const handleDeleteClick = (admissionId, followUpIndex) => {
    setFollowUpToDelete({ admissionId, followUpIndex });
    setDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (followUpToDelete) {
      deleteFollowUpMutation.mutate(followUpToDelete);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setFollowUpToDelete(null);
  };

  // Filter and search admissions
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((admission) => {
      const matchesSearch =
        admission.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admission.phone?.includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" ||
        admission.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [admissions, searchQuery, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: admissions.length,
      withFollowUps: admissions.filter((a) => a.followUps?.length > 0).length,
      pending: admissions.filter((a) => a.status?.toLowerCase() === "inquiry")
        .length,
    };
  }, [admissions]);

  if (isLoading) {
    return <Loader message="Loading follow-ups..." />;
  }

  return (
    <div className="min-h-screen bg-base-200/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-warning to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <BiSolidPhoneCall className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                Admission Follow-ups
              </h1>
              <p className="text-sm text-base-content/60">
                Track and manage follow-up communications with prospective
                students
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-base-100 rounded-xl p-3 border border-base-300/50 shadow-sm">
              <div className="text-2xl font-bold text-base-content">
                {stats.total}
              </div>
              <div className="text-xs text-base-content/60 flex items-center gap-1">
                <FaUserPlus className="text-sm" />
                Total
              </div>
            </div>
            <div className="bg-warning/10 rounded-xl p-3 border border-warning/20 shadow-sm">
              <div className="text-2xl font-bold text-warning">
                {stats.withFollowUps}
              </div>
              <div className="text-xs text-warning/80 flex items-center gap-1">
                <FaCommentDots className="text-sm" />
                With Notes
              </div>
            </div>
            <div className="bg-info/10 rounded-xl p-3 border border-info/20 shadow-sm">
              <div className="text-2xl font-bold text-info">
                {stats.pending}
              </div>
              <div className="text-xs text-info/80 flex items-center gap-1">
                <FaClock className="text-sm" />
                Pending
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-12 pr-4 bg-base-200 focus:bg-base-100 transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <MdFilterList className="text-xl text-base-content/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select select-bordered bg-base-200 focus:bg-base-100 min-w-[160px]"
              >
                <option value="all">All Status</option>
                <option value="inquiry">Inquiry</option>
                <option value="follow-up">Follow-up</option>
                <option value="enrolled">Enrolled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admissions List */}
        <div className="space-y-4">
          {filteredAdmissions.length > 0 ? (
            filteredAdmissions.map((admission, index) => (
              <div
                key={admission._id}
                className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden hover:shadow-md transition-all duration-300"
                style={{
                  animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`,
                }}
              >
                {/* Admission Card Header */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <FaUserPlus className="text-primary text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                          {admission.name}
                          {admission.followUps?.length > 0 && (
                            <span className="badge badge-sm badge-warning gap-1">
                              <FaCommentDots className="text-xs" />
                              {admission.followUps.length}
                            </span>
                          )}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className="text-sm text-base-content/60 flex items-center gap-1">
                            <MdPhone className="text-sm" />
                            {admission.phone}
                          </span>
                          <div
                            className={`badge badge-sm gap-1 ${
                              admission.status?.toLowerCase() === "inquiry"
                                ? "badge-info"
                                : admission.status?.toLowerCase() ===
                                  "follow-up"
                                ? "badge-warning"
                                : admission.status?.toLowerCase() === "enrolled"
                                ? "badge-success"
                                : "badge-error"
                            }`}
                          >
                            {admission.status?.toLowerCase() === "inquiry" ? (
                              <FaClock className="text-xs" />
                            ) : admission.status?.toLowerCase() ===
                              "follow-up" ? (
                              <BiSolidPhoneCall className="text-xs" />
                            ) : admission.status?.toLowerCase() ===
                              "enrolled" ? (
                              <FaUserCheck className="text-xs" />
                            ) : (
                              <FaBan className="text-xs" />
                            )}
                            <span className="capitalize">
                              {admission.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        if (activeId === admission._id) {
                          setActiveId(null);
                          setFollowUpDate(null);
                          reset();
                        } else {
                          setActiveId(admission._id);
                        }
                      }}
                      className={`btn ${
                        activeId === admission._id
                          ? "btn-ghost"
                          : "btn-primary text-white"
                      } btn-sm shadow-sm hover:shadow-md transition-all duration-300 group`}
                    >
                      {activeId === admission._id ? (
                        <>
                          <MdClose className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <MdEdit className="text-lg group-hover:scale-110 transition-transform duration-300" />
                          Add Follow-up
                        </>
                      )}
                    </button>
                  </div>

                  {/* Follow-up Form */}
                  {activeId === admission._id && (
                    <form
                      onSubmit={handleFormSubmit(handleSubmit)}
                      className="mt-6 p-6 bg-base-200/50 rounded-xl border border-base-300/50 space-y-4"
                    >
                      <h4 className="text-sm font-semibold text-base-content flex items-center gap-2">
                        <FaCommentDots className="text-primary" />
                        Add New Follow-up Note
                      </h4>

                      <div className="space-y-4">
                        {/* Note Textarea */}
                        <div className="group">
                          <label className="block text-sm font-semibold text-base-content mb-2">
                            Follow-up Note
                            <span className="text-error ml-1">*</span>
                          </label>
                          <textarea
                            {...register("note", {
                              required: "Follow-up note is required",
                            })}
                            placeholder="Enter follow-up details, conversation notes, or next steps..."
                            rows={4}
                            className={`textarea textarea-bordered w-full bg-base-100 transition-all duration-200 focus:outline-none focus:ring-2 ${
                              errors.note
                                ? "border-error focus:border-error focus:ring-error/20"
                                : "border-base-300 focus:border-primary focus:ring-primary/20 hover:border-base-content/30"
                            }`}
                          />
                          {errors.note && (
                            <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                              <span>⚠</span>
                              {errors.note.message}
                            </p>
                          )}
                        </div>

                        {/* Date Picker */}
                        <div className="group">
                          <label className="block text-sm font-semibold text-base-content mb-2">
                            Follow-up Date
                          </label>
                          <Controller
                            control={control}
                            name="date"
                            render={({ field }) => (
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors z-10 pointer-events-none">
                                  <MdCalendarToday />
                                </div>
                                <DatePicker
                                  selected={
                                    field.value
                                      ? new Date(field.value)
                                      : followUpDate
                                  }
                                  onChange={(date) => {
                                    setFollowUpDate(date);
                                    field.onChange(date?.toISOString());
                                  }}
                                  dateFormat="MMMM d, yyyy"
                                  placeholderText="Select follow-up date (optional)"
                                  className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-base-content/30 transition-all duration-200"
                                  calendarClassName="custom-datepicker"
                                  wrapperClassName="w-full"
                                />
                              </div>
                            )}
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={followUpMutation.isPending}
                            className="btn btn-primary text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                          >
                            {followUpMutation.isPending ? (
                              <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Saving...
                              </>
                            ) : (
                              <>
                                <MdCheck className="text-lg" />
                                Save Follow-up
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Previous Follow-ups */}
                {admission.followUps?.length > 0 && (
                  <div className="border-t border-base-300 bg-base-200/30">
                    {/* Collapsible Header */}
                    <button
                      onClick={() => toggleFollowUps(admission._id)}
                      className="w-full p-6 flex items-center justify-between hover:bg-base-200/50 transition-colors group"
                    >
                      <h4 className="text-sm font-semibold text-base-content flex items-center gap-2">
                        <FaCommentDots className="text-secondary" />
                        Previous Follow-ups ({admission.followUps.length})
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-base-content/60">
                          {expandedFollowUps[admission._id] ? "Hide" : "Show"}{" "}
                          details
                        </span>
                        {expandedFollowUps[admission._id] ? (
                          <MdExpandLess className="text-2xl text-base-content/60 group-hover:text-primary transition-colors" />
                        ) : (
                          <MdExpandMore className="text-2xl text-base-content/60 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </button>

                    {/* Collapsible Content */}
                    {expandedFollowUps[admission._id] && (
                      <div className="px-6 pb-6 space-y-3 animate-slideDown">
                        {admission.followUps.map((followUp, idx) => (
                          <div
                            key={idx}
                            className="bg-base-100 rounded-xl p-4 border border-base-300/50 hover:border-primary/30 transition-colors group"
                            style={{
                              animation: `fadeIn 0.3s ease-in-out ${
                                idx * 0.05
                              }s both`,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                                <FaCommentDots className="text-secondary text-sm" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-base-content leading-relaxed">
                                  {followUp.note}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <MdCalendarToday className="text-xs text-base-content/40" />
                                  <span className="text-xs text-base-content/60">
                                    {new Date(followUp.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>
                              </div>
                              {/* Delete Button */}
                              <button
                                onClick={() =>
                                  handleDeleteClick(admission._id, idx)
                                }
                                className="btn btn-ghost btn-sm btn-circle text-error opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-error/10"
                                title="Delete follow-up"
                              >
                                <MdDelete className="text-lg" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 p-12">
              <div className="flex flex-col items-center gap-3">
                <FaUserPlus className="text-5xl text-base-content/20" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-base-content/60">
                    No admissions found
                  </p>
                  <p className="text-sm text-base-content/40">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="modal modal-open">
            <div className="modal-box max-w-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center shrink-0">
                  <MdWarning className="text-error text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-base-content mb-2">
                    Delete Follow-up
                  </h3>
                  <p className="text-sm text-base-content/70 leading-relaxed">
                    Are you sure you want to delete this follow-up note? This
                    action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="modal-action">
                <button
                  onClick={handleCancelDelete}
                  className="btn btn-ghost"
                  disabled={deleteFollowUpMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="btn btn-error text-white"
                  disabled={deleteFollowUpMutation.isPending}
                >
                  {deleteFollowUpMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <MdDelete className="text-lg" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={handleCancelDelete}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionFollowUps;
