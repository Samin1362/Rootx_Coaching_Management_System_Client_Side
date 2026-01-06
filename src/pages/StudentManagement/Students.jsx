import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  MdEdit,
  MdVisibility,
  MdSearch,
  MdNavigateNext,
  MdNavigateBefore,
  MdFilterList,
  MdPeople,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdPerson,
  MdDelete,
  MdClose,
  MdWarning,
  MdSchool,
  MdCalendarToday,
  MdImage,
  MdSave,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import {
  FaUserGraduate,
  FaCheckCircle,
  FaClock,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Students = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [dob, setDob] = useState(null);
  const [admissionDate, setAdmissionDate] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const widgetRef = useRef();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data;
    },
  });

  // Fetch batches for batch name mapping
  const { data: batches = [] } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data;
    },
  });

  // Initialize Cloudinary widget
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;

    script.onload = () => {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        },
        (error, result) => {
          if (!error && result?.event === "success") {
            setImageUrl(result.info.secure_url);
          }
        }
      );
    };

    document.body.appendChild(script);
    return () =>
      document.body.contains(script) && document.body.removeChild(script);
  }, []);

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId) => {
      const res = await axiosSecure.delete(`/students/${studentId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      setDeleteModalOpen(false);
      setStudentToDelete(null);
    },
    onError: (error) => {
      alert(
        error.response?.data?.message ||
          "Failed to delete student. Please try again."
      );
    },
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosSecure.patch(`/students/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["students"]);
      alert("Student updated successfully!");
      handleCloseEditModal();
    },
    onError: (error) => {
      alert(
        error.response?.data?.message ||
          "Failed to update student. Please try again."
      );
    },
  });

  // Handle edit button click
  const handleEditClick = useCallback(
    (student) => {
      setStudentToEdit(student);
      setEditModalOpen(true);
      setImageUrl(student.image || "");
      setDob(student.dob ? new Date(student.dob) : null);
      setAdmissionDate(
        student.admissionDate ? new Date(student.admissionDate) : null
      );

      // Pre-fill form with student data
      reset({
        name: student.name || "",
        gender: student.gender || "",
        dob: student.dob || "",
        phone: student.phone || "",
        email: student.email || "",
        address: student.address || "",
        guardianName: student.guardianName || "",
        guardianPhone: student.guardianPhone || "",
        previousInstitute: student.previousInstitute || "",
        batchId: student.batchId || "",
        status: student.status || "active",
        admissionDate: student.admissionDate || "",
      });
    },
    [reset]
  );

  // Handle edit form submit
  const onEditSubmit = (data) => {
    if (!studentToEdit) return;

    const updatedStudent = {
      ...data,
      image: imageUrl,
    };

    updateStudentMutation.mutate({
      id: studentToEdit._id,
      data: updatedStudent,
    });
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setStudentToEdit(null);
    setImageUrl("");
    setDob(null);
    setAdmissionDate(null);
    reset();
  };

  // Handle delete button click
  const handleDeleteClick = useCallback((student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (studentToDelete) {
      deleteStudentMutation.mutate(studentToDelete._id);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  // Toggle row expansion for mobile
  const toggleRowExpansion = useCallback((rowId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  // Helper function to get batch info from batch ID
  const getBatchInfo = useCallback(
    (batchId) => {
      const batch = batches.find((b) => b._id === batchId);
      if (batch) {
        return {
          name: batch.name,
          course: batch.course,
        };
      }
      return { name: batchId || "N/A", course: "" };
    },
    [batches]
  );

  // Filter students based on status and gender
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesStatus =
        statusFilter === "all" ||
        student.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesGender =
        genderFilter === "all" ||
        student.gender?.toLowerCase() === genderFilter.toLowerCase();
      return matchesStatus && matchesGender;
    });
  }, [students, statusFilter, genderFilter]);

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Student",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 min-w-50">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={row.original.image || "https://via.placeholder.com/48"}
                  alt={row.original.name}
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div className="font-semibold text-base-content flex items-center gap-2">
                {row.original.name}
              </div>
              <div className="text-xs text-base-content/60 flex items-center gap-1">
                <MdEmail className="text-xs" />
                {row.original.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            {getValue() === "Male" ? (
              <>
                <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
                  <BsGenderMale className="text-info text-sm" />
                </div>
                <span className="text-sm font-medium text-base-content">
                  Male
                </span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <BsGenderFemale className="text-secondary text-sm" />
                </div>
                <span className="text-sm font-medium text-base-content">
                  Female
                </span>
              </>
            )}
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-sm">
            <MdPhone className="text-base-content/40" />
            <span className="text-base-content font-medium">{getValue()}</span>
          </div>
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-sm max-w-50">
            <MdLocationOn className="text-base-content/40 shrink-0" />
            <span className="text-base-content truncate">{getValue()}</span>
          </div>
        ),
      },
      {
        accessorKey: "guardianName",
        header: "Guardian",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-37.5">
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <FaUserTie className="text-warning text-xs" />
            </div>
            <div>
              <div className="text-sm font-medium text-base-content">
                {row.original.guardianName}
              </div>
              <div className="text-xs text-base-content/60 flex items-center gap-1">
                <MdPhone className="text-xs" />
                {row.original.guardianPhone}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "batchId",
        header: "Batch",
        cell: ({ getValue }) => {
          const batchInfo = getBatchInfo(getValue());
          return (
            <div className="flex flex-col gap-1 min-w-37.5">
              <div className="badge badge-outline badge-primary font-medium">
                {batchInfo.name}
              </div>
              {batchInfo.course && (
                <span className="text-xs text-base-content/60">
                  {batchInfo.course}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <div
              className={`badge gap-2 font-medium ${
                status === "Active"
                  ? "badge-success"
                  : status === "Inactive"
                  ? "badge-error"
                  : "badge-warning"
              }`}
            >
              {status === "Active" ? (
                <FaCheckCircle className="text-xs" />
              ) : (
                <FaClock className="text-xs" />
              )}
              {status}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Admission Date",
        cell: ({ getValue }) => (
          <div className="text-sm text-base-content/70">
            {new Date(getValue()).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-ghost btn-square hover:bg-primary/10 hover:text-primary transition-all duration-200"
              title="View Details"
            >
              <MdVisibility className="text-lg" />
            </button>
            <button
              onClick={() => handleEditClick(row.original)}
              className="btn btn-sm btn-ghost btn-square hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
              title="Edit Student"
            >
              <MdEdit className="text-lg" />
            </button>
            <button
              onClick={() => handleDeleteClick(row.original)}
              className="btn btn-sm btn-ghost btn-square hover:bg-error/10 hover:text-error transition-all duration-200"
              title="Delete Student"
            >
              <MdDelete className="text-lg" />
            </button>
          </div>
        ),
      },
    ],
    [handleDeleteClick, handleEditClick, getBatchInfo]
  );

  const table = useReactTable({
    data: filteredStudents,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/60">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        {/* Header Section */}
        <div className="bg-base-200 rounded-2xl p-6 shadow-sm border border-base-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                  <FaUserGraduate className="text-white text-xl" />
                </div>
                All Students
              </h1>
              <p className="text-base-content/60 mt-2 ml-15">
                Manage and track all student records
              </p>
            </div>
            <div className="stats shadow-md bg-base-100">
              <div className="stat py-4 px-6">
                <div className="stat-title text-xs">Total Students</div>
                <div className="stat-value text-2xl text-primary">
                  {filteredStudents.length}
                </div>
                <div className="stat-desc text-xs">
                  {students.filter((s) => s.status === "Active").length} Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or address..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
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
                className="select select-bordered bg-base-200 focus:bg-base-100 min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div className="flex items-center gap-2">
              <MdPeople className="text-xl text-base-content/40" />
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="select select-bordered bg-base-200 focus:bg-base-100 min-w-[140px]"
              >
                <option value="all">All Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== "all" ||
            genderFilter !== "all" ||
            globalFilter) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-base-content/60">
                Active filters:
              </span>
              {globalFilter && (
                <div className="badge badge-primary gap-2">
                  Search: {globalFilter}
                  <button
                    onClick={() => setGlobalFilter("")}
                    className="hover:text-error"
                  >
                    ✕
                  </button>
                </div>
              )}
              {statusFilter !== "all" && (
                <div className="badge badge-secondary gap-2">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="hover:text-error"
                  >
                    ✕
                  </button>
                </div>
              )}
              {genderFilter !== "all" && (
                <div className="badge badge-accent gap-2">
                  Gender: {genderFilter}
                  <button
                    onClick={() => setGenderFilter("all")}
                    className="hover:text-error"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="table table-zebra">
              <thead className="bg-base-200">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-base-content font-semibold text-sm cursor-pointer hover:bg-base-300 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() && (
                            <span className="text-primary">
                              {header.column.getIsSorted() === "asc"
                                ? "↑"
                                : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-base-200 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Accordion View */}
          <div className="md:hidden">
            {table.getRowModel().rows.map((row, index) => {
              const student = row.original;
              const batchInfo = getBatchInfo(student.batchId);
              const isExpanded = expandedRows.has(row.id);

              return (
                <div
                  key={row.id}
                  className="border-b border-base-300 last:border-b-0 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Collapsed Row - Main Info */}
                  <div
                    className="p-4 hover:bg-base-200 transition-colors cursor-pointer"
                    onClick={() => toggleRowExpansion(row.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Student Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Profile Image */}
                        <div className="avatar shrink-0">
                          <div className="w-12 h-12 rounded-full ring-2 ring-primary/20">
                            {student.image ? (
                              <img src={student.image} alt={student.name} />
                            ) : (
                              <div className="w-full h-full bg-base-200 flex items-center justify-center">
                                <FaUserGraduate className="text-xl text-base-content/30" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Name and Status */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base-content truncate">
                            {student.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`badge badge-sm ${
                                student.status?.toLowerCase() === "active"
                                  ? "badge-success"
                                  : "badge-warning"
                              }`}
                            >
                              {student.status || "Active"}
                            </span>
                            {student.gender && (
                              <span className="text-xs text-base-content/60">
                                {student.gender === "Male" ? (
                                  <BsGenderMale className="inline" />
                                ) : (
                                  <BsGenderFemale className="inline" />
                                )}{" "}
                                {student.gender}
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

                  {/* Expanded Row - Full Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-base-200/50 space-y-3">
                      {/* Contact Info */}
                      <div className="space-y-2">
                        {student.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <MdPhone className="text-primary shrink-0" />
                            <span className="text-base-content/70">
                              {student.phone}
                            </span>
                          </div>
                        )}
                        {student.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <MdEmail className="text-primary shrink-0" />
                            <span className="text-base-content/70 truncate">
                              {student.email}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Batch Info */}
                      {batchInfo && (
                        <div className="flex items-start gap-2 text-sm">
                          <MdSchool className="text-primary shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-base-content">
                              {batchInfo.name}
                            </div>
                            <div className="text-xs text-base-content/60">
                              {batchInfo.course}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Guardian Info */}
                      {student.guardianName && (
                        <div className="flex items-center gap-2 text-sm">
                          <FaUserTie className="text-primary shrink-0" />
                          <span className="text-base-content/70">
                            Guardian: {student.guardianName}
                          </span>
                        </div>
                      )}

                      {/* Admission Date */}
                      {student.admissionDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <MdCalendarToday className="text-primary shrink-0" />
                          <span className="text-base-content/70">
                            Admitted:{" "}
                            {new Date(
                              student.admissionDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(student);
                          }}
                          className="btn btn-sm btn-primary gap-2 flex-1"
                        >
                          <MdEdit />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(student);
                          }}
                          className="btn btn-sm btn-error gap-2 flex-1"
                        >
                          <MdDelete />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {table.getRowModel().rows.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUserGraduate className="text-4xl text-base-content/20" />
              </div>
              <p className="text-base-content/60 text-lg font-medium">
                No students found
              </p>
              <p className="text-base-content/40 text-sm mt-2">
                Try adjusting your filters or search query
              </p>
            </div>
          )}

          {/* Pagination */}
          {table.getRowModel().rows.length > 0 && (
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-6 bg-base-200 border-t border-base-300">
              <div className="text-sm text-base-content/70">
                Showing{" "}
                <span className="font-semibold text-base-content">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-base-content">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    filteredStudents.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-base-content">
                  {filteredStudents.length}
                </span>{" "}
                students
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="btn btn-sm btn-outline hover:btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdNavigateBefore className="text-lg" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: table.getPageCount() },
                    (_, i) => i
                  ).map((pageIndex) => {
                    const currentPage = table.getState().pagination.pageIndex;
                    // Show first, last, current, and adjacent pages
                    if (
                      pageIndex === 0 ||
                      pageIndex === table.getPageCount() - 1 ||
                      Math.abs(pageIndex - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={pageIndex}
                          onClick={() => table.setPageIndex(pageIndex)}
                          className={`btn btn-sm ${
                            pageIndex === currentPage
                              ? "btn-primary"
                              : "btn-ghost"
                          }`}
                        >
                          {pageIndex + 1}
                        </button>
                      );
                    } else if (Math.abs(pageIndex - currentPage) === 2) {
                      return (
                        <span key={pageIndex} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="btn btn-sm btn-outline hover:btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <MdNavigateNext className="text-lg" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-base-content/70">
                  Rows per page:
                </span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="select select-bordered select-sm bg-base-100"
                >
                  {[5, 10, 20, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Student Modal */}
      {editModalOpen && (
        <div className="modal modal-open fixed inset-0 z-9999 flex items-center justify-center">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto relative z-10000">
            <button
              onClick={handleCloseEditModal}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
            >
              <MdClose className="text-lg" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                <MdEdit className="text-white text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">
                  Edit Student
                </h3>
                <p className="text-xs text-base-content/60">
                  Update student information
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)}>
              {/* Personal Information Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                  <MdPerson className="text-primary" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Full Name
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <MdPerson />
                      </div>
                      <input
                        {...register("name", {
                          required: "Student name is required",
                        })}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 ${
                          errors.name
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-base-300 focus:border-primary focus:ring-primary/20"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-error mt-1.5">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Gender
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 z-10">
                        <BsGenderMale />
                      </div>
                      <select
                        {...register("gender", {
                          required: "Gender is required",
                        })}
                        className={`w-full border rounded-xl pl-10 pr-10 py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
                          errors.gender
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-base-300 focus:border-primary focus:ring-primary/20"
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    {errors.gender && (
                      <p className="text-xs text-error mt-1.5">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Date of Birth
                    </label>
                    <Controller
                      control={control}
                      name="dob"
                      render={({ field }) => (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 z-10 pointer-events-none">
                            <MdCalendarToday />
                          </div>
                          <DatePicker
                            selected={field.value ? new Date(field.value) : dob}
                            onChange={(date) => {
                              setDob(date);
                              field.onChange(date?.toISOString());
                            }}
                            dateFormat="MMMM d, yyyy"
                            placeholderText="Select date of birth"
                            maxDate={new Date()}
                            className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            wrapperClassName="w-full"
                          />
                        </div>
                      )}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Phone Number
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <MdPhone />
                      </div>
                      <input
                        {...register("phone", {
                          required: "Phone number is required",
                        })}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 ${
                          errors.phone
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-base-300 focus:border-primary focus:ring-primary/20"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-error mt-1.5">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <MdEmail />
                      </div>
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <MdLocationOn />
                      </div>
                      <input
                        {...register("address")}
                        className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian Information Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                  <FaUserTie className="text-secondary" />
                  Guardian Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Guardian Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <FaUserTie />
                      </div>
                      <input
                        {...register("guardianName")}
                        className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Guardian Phone
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <MdPhone />
                      </div>
                      <input
                        {...register("guardianPhone")}
                        className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                  <MdSchool className="text-primary" />
                  Academic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Previous Institution
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <MdSchool />
                      </div>
                      <input
                        {...register("previousInstitute")}
                        className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Batch
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 z-10">
                        <FaUsers />
                      </div>
                      <select
                        {...register("batchId", {
                          required: "Please select a batch",
                        })}
                        className={`w-full border rounded-xl pl-10 pr-10 py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
                          errors.batchId
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-base-300 focus:border-primary focus:ring-primary/20"
                        }`}
                      >
                        <option value="">Select a batch</option>
                        {batches.map((batch) => (
                          <option key={batch._id} value={batch._id}>
                            {batch.name} — {batch.course} ({batch.schedule})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.batchId && (
                      <p className="text-xs text-error mt-1.5">
                        {errors.batchId.message}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Admission Date
                    </label>
                    <Controller
                      control={control}
                      name="admissionDate"
                      render={({ field }) => (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 z-10 pointer-events-none">
                            <MdCalendarToday />
                          </div>
                          <DatePicker
                            selected={
                              field.value
                                ? new Date(field.value)
                                : admissionDate
                            }
                            onChange={(date) => {
                              setAdmissionDate(date);
                              field.onChange(date?.toISOString());
                            }}
                            dateFormat="MMMM d, yyyy"
                            placeholderText="Select admission date"
                            maxDate={new Date()}
                            className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            wrapperClassName="w-full"
                          />
                        </div>
                      )}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Student Status
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 z-10">
                        <FaCheckCircle />
                      </div>
                      <select
                        {...register("status")}
                        className="w-full border rounded-xl pl-10 pr-10 py-3 bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Image Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                  <MdImage className="text-secondary" />
                  Student Photo
                </h4>
                <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl border border-base-300/50">
                  {imageUrl ? (
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-primary">
                        <img
                          src={imageUrl}
                          alt="Student"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-base-300/50 rounded-xl border-2 border-dashed border-base-content/20 flex items-center justify-center">
                      <MdImage className="text-2xl text-base-content/30" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => widgetRef.current?.open()}
                    className="btn btn-outline btn-primary btn-sm"
                  >
                    <MdImage />
                    {imageUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-base-300">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="btn btn-ghost"
                  disabled={updateStudentMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStudentMutation.isPending}
                  className="btn btn-primary text-white"
                >
                  {updateStudentMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <MdSave />
                      Update Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-9998"
            onClick={handleCloseEditModal}
          ></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal modal-open fixed inset-0 z-9999 flex items-center justify-center">
          <div className="modal-box relative z-10000">
            <button
              onClick={handleCancelDelete}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <MdClose className="text-lg" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
                <MdWarning className="text-error text-2xl" />
              </div>
              <h3 className="font-bold text-lg text-base-content">
                Delete Student
              </h3>
            </div>

            <div className="py-4">
              <p className="text-base-content/80 mb-4">
                Are you sure you want to delete this student? This action cannot
                be undone.
              </p>

              {studentToDelete && (
                <div className="bg-base-200 rounded-xl p-4 border border-base-300">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full ring ring-error ring-offset-base-100 ring-offset-2">
                        <img
                          src={
                            studentToDelete.image ||
                            "https://via.placeholder.com/48"
                          }
                          alt={studentToDelete.name}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-base-content">
                        {studentToDelete.name}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {studentToDelete.email}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {studentToDelete.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="alert alert-warning mt-4">
                <MdWarning className="text-lg" />
                <div>
                  <h4 className="font-semibold text-sm">Warning</h4>
                  <p className="text-xs">
                    Deleting this student will permanently remove all their
                    records from the system.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={handleCancelDelete}
                className="btn btn-ghost"
                disabled={deleteStudentMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteStudentMutation.isPending}
                className="btn btn-error text-white"
              >
                {deleteStudentMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <MdDelete />
                    Delete Student
                  </>
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-9998"
            onClick={handleCancelDelete}
          ></div>
        </div>
      )}
    </>
  );
};

export default Students;
