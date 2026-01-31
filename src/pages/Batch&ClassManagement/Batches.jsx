import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  MdSchool,
  MdEdit,
  MdVisibility,
  MdCheckCircle,
  MdSearch,
  MdNavigateNext,
  MdNavigateBefore,
  MdFilterList,
  MdCalendarToday,
  MdPeople,
  MdExpandMore,
  MdExpandLess,
  MdClose,
  MdSave,
  MdBook,
  MdSchedule,
  MdPerson,
  MdEvent,
  MdInfo,
  MdDelete,
  MdWarning,
  MdAccessTime,
} from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import { FaCheckCircle, FaClock, FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";

const Batches = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const notification = useNotification();
  const navigate = useNavigate();

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [daySchedules, setDaySchedules] = useState([]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  // Toggle row expansion for mobile
  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Format schedule string from day schedules with smart grouping
  const formatSchedule = (daySchedules) => {
    if (!daySchedules || daySchedules.length === 0) return "";

    // Helper: Convert 24h to 12h format
    const convertTo12Hour = (time24) => {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? 'AM' : 'PM';
      return `${displayHour}:${minutes} ${period}`;
    };

    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayAbbr = {
      Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
      Thursday: "Thu", Friday: "Fri", Saturday: "Sat"
    };

    // Sort by day order
    const sorted = [...daySchedules].sort((a, b) =>
      dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
    );

    // Group by identical times
    const groups = [];
    sorted.forEach(schedule => {
      const timeKey = `${schedule.startTime}|${schedule.endTime}`;
      let group = groups.find(g => g.timeKey === timeKey);

      if (!group) {
        group = { timeKey, days: [], startTime: schedule.startTime, endTime: schedule.endTime };
        groups.push(group);
      }
      group.days.push(schedule.day);
    });

    // Format each group
    const formatted = groups.map(group => {
      const timeStr = `${convertTo12Hour(group.startTime)}–${convertTo12Hour(group.endTime)}`;

      if (group.days.length === 1) {
        return `${dayAbbr[group.days[0]]} ${timeStr}`;
      }

      // Check if days are consecutive
      const indices = group.days.map(d => dayOrder.indexOf(d));
      const isConsecutive = indices.every((val, i, arr) =>
        i === 0 || val === arr[i - 1] + 1
      );

      if (isConsecutive && group.days.length > 2) {
        return `${dayAbbr[group.days[0]]}–${dayAbbr[group.days[group.days.length - 1]]} ${timeStr}`;
      }

      return `${group.days.map(d => dayAbbr[d]).join(", ")} ${timeStr}`;
    });

    return formatted.join("; ");
  };

  // Parse existing schedule string into day schedules array
  const parseScheduleString = (scheduleStr) => {
    if (!scheduleStr) return [];

    try {
      const dayMap = {
        "Sun": "Sunday", "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday",
        "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday",
        "Sunday": "Sunday", "Monday": "Monday", "Tuesday": "Tuesday",
        "Wednesday": "Wednesday", "Thursday": "Thursday", "Friday": "Friday", "Saturday": "Saturday"
      };

      const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const result = [];

      // Split by semicolon for multiple time slots
      const segments = scheduleStr.split(';').map(s => s.trim());

      segments.forEach(segment => {
        // Match pattern: "Mon-Wed 10:00 AM-11:30 AM" or "Mon, Wed 10:00 AM-11:30 AM"
        const timeMatch = segment.match(/(\d{1,2}):(\d{2})\s*(AM|PM)[^\d]*(\d{1,2}):(\d{2})\s*(AM|PM)/i);

        if (timeMatch) {
          // Convert to 24-hour format
          let startHour = parseInt(timeMatch[1]);
          const startMin = timeMatch[2];
          const startPeriod = timeMatch[3].toUpperCase();

          let endHour = parseInt(timeMatch[4]);
          const endMin = timeMatch[5];
          const endPeriod = timeMatch[6].toUpperCase();

          if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
          if (startPeriod === 'AM' && startHour === 12) startHour = 0;
          if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
          if (endPeriod === 'AM' && endHour === 12) endHour = 0;

          const startTime = `${String(startHour).padStart(2, '0')}:${startMin}`;
          const endTime = `${String(endHour).padStart(2, '0')}:${endMin}`;

          // Extract day part (everything before the time)
          const dayPart = segment.substring(0, segment.indexOf(timeMatch[0])).trim();

          // Check for range (Mon-Wed)
          if (dayPart.includes('–') || dayPart.includes('-')) {
            const [startDay, endDay] = dayPart.split(/[-–]/).map(d => d.trim());
            const startDayFull = dayMap[startDay];
            const endDayFull = dayMap[endDay];

            if (startDayFull && endDayFull) {
              const startIdx = dayOrder.indexOf(startDayFull);
              const endIdx = dayOrder.indexOf(endDayFull);

              for (let i = startIdx; i <= endIdx; i++) {
                result.push({ day: dayOrder[i], startTime, endTime });
              }
            }
          } else {
            // Individual days separated by comma
            const days = dayPart.split(',').map(d => d.trim());
            days.forEach(day => {
              const fullDay = dayMap[day];
              if (fullDay) {
                result.push({ day: fullDay, startTime, endTime });
              }
            });
          }
        }
      });

      return result;
    } catch (error) {
      console.error("Error parsing schedule:", error);
      return [];
    }
  };

  // Update batch mutation
  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosSecure.patch(`/batches/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["batches"]);
      notification.success("Batch updated successfully!", "Success");
      handleCloseEditModal();
    },
    onError: (error) => {
      notification.error(
        error.response?.data?.message || "Failed to update batch. Please try again.",
        "Update Failed"
      );
    },
  });

  // Open edit modal
  const handleOpenEditModal = (batch) => {
    setBatchToEdit(batch);
    setStartDate(batch.startDate ? new Date(batch.startDate) : null);
    setEndDate(batch.endDate ? new Date(batch.endDate) : null);

    // Parse existing schedule into daySchedules array
    const parsedSchedule = parseScheduleString(batch.schedule || "");
    setDaySchedules(parsedSchedule);

    reset({
      name: batch.name || "",
      course: batch.course || "",
      capacity: batch.capacity || "",
      fees: batch.fees || "",
      instructor: batch.instructor || "",
      status: batch.status || "active",
    });

    setEditModalOpen(true);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setBatchToEdit(null);
    setStartDate(null);
    setEndDate(null);
    setDaySchedules([]);
    reset();
  };

  // Form submit handler
  const onEditSubmit = (data) => {
    if (!batchToEdit) return;

    // Format schedule from daySchedules
    const scheduleStr = formatSchedule(daySchedules);

    if (!scheduleStr) {
      notification.error("Please select schedule days and time");
      return;
    }

    const updatedBatch = {
      ...data,
      schedule: scheduleStr,
      capacity: parseInt(data.capacity) || 0,
      fees: parseFloat(data.fees) || 0,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    };

    updateBatchMutation.mutate({
      id: batchToEdit._id,
      data: updatedBatch,
    });
  };

  // Delete batch mutation
  const deleteBatchMutation = useMutation({
    mutationFn: async (batchId) => {
      const res = await axiosSecure.delete(`/batches/${batchId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["batches"]);
      queryClient.invalidateQueries(["batch-students"]);
      queryClient.invalidateQueries(["batch-attendance"]);
      queryClient.invalidateQueries(["batch-exams"]);
      notification.success(
        "Batch and all associated records deleted successfully!",
        "Batch Deleted"
      );
      setDeleteModalOpen(false);
      setBatchToDelete(null);
    },
    onError: (error) => {
      notification.error(
        error.response?.data?.message ||
          "Failed to delete batch. Please try again.",
        "Delete Failed"
      );
    },
  });

  const handleDeleteClick = (batch) => {
    setBatchToDelete(batch);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (batchToDelete) {
      deleteBatchMutation.mutate(batchToDelete._id);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setBatchToDelete(null);
  };

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches?limit=1000");
      return res.data.data || [];
    },
  });

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Batch Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-sm">
              <MdSchool className="text-white text-lg" />
            </div>
            <div>
              <div className="font-semibold text-base-content">
                {row.original.name}
              </div>
              <div className="text-xs text-base-content/60">
                {row.original.course}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "schedule",
        header: "Schedule",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-sm">
            <MdCalendarToday className="text-base-content/40" />
            <span className="text-base-content">{getValue()}</span>
          </div>
        ),
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <MdPeople className="text-primary text-sm" />
            </div>
            <span className="font-medium text-base-content">{getValue()}</span>
          </div>
        ),
      },
      {
        accessorKey: "fees",
        header: "Fees",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <TbCurrencyTaka className="text-secondary text-lg" />
            </div>
            <span className="font-semibold text-base-content">
              ৳{getValue()?.toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ getValue }) => {
          const date = getValue();
          return (
            <div className="text-sm text-base-content">
              {date
                ? new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "-"}
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                status === "active"
                  ? "bg-success/10 text-success"
                  : "bg-base-content/10 text-base-content/60"
              }`}
            >
              {status === "active" ? (
                <FaCheckCircle className="text-xs" />
              ) : (
                <FaClock className="text-xs" />
              )}
              {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/dashboard/batchManagement/batches/${row.original._id}`)}
              className="btn btn-sm btn-ghost text-primary hover:bg-primary/10 transition-all duration-200"
              title="View Details"
            >
              <MdVisibility />
            </button>
            <button
              onClick={() => handleOpenEditModal(row.original)}
              className="btn btn-sm btn-ghost text-secondary hover:bg-secondary/10 transition-all duration-200"
              title="Edit Batch"
            >
              <MdEdit />
            </button>
            <button
              onClick={() => handleDeleteClick(row.original)}
              className="btn btn-sm btn-ghost text-error hover:bg-error/10 transition-all duration-200"
              title="Delete Batch"
            >
              <MdDelete />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: batches,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return <Loader message="Loading batches..." />;
  }

  return (
    <div className="min-h-screen bg-base-200/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                  <MdSchool className="text-2xl text-white" />
                </div>
                All Batches
              </h1>
              <p className="text-sm text-base-content/60 mt-2 ml-15">
                Manage and monitor all coaching batches
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-base-100 rounded-xl px-4 py-2 shadow-sm border border-base-300/50">
                <div className="text-2xl font-bold text-primary">
                  {batches.filter((b) => b.status === "active").length}
                </div>
                <div className="text-xs text-base-content/60">Active</div>
              </div>
              <div className="bg-base-100 rounded-xl px-4 py-2 shadow-sm border border-base-300/50">
                <div className="text-2xl font-bold text-base-content">
                  {batches.length}
                </div>
                <div className="text-xs text-base-content/60">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300/50 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
              <input
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search batches by name, course, or schedule..."
                className="w-full pl-10 pr-4 py-3 bg-base-200 text-base-content rounded-xl border border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <button className="btn btn-ghost gap-2 text-base-content">
              <MdFilterList className="text-lg" />
              Filters
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300/50 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200/80">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-base-content font-semibold text-sm py-4 cursor-pointer hover:bg-base-300/30 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() && (
                            <span>
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
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-12 text-base-content/60"
                    >
                      No batches found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="hover:bg-base-200/50 transition-all duration-200 animate-fadeIn"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Accordion View */}
          <div className="md:hidden">
            {table.getRowModel().rows.length === 0 ? (
              <div className="text-center py-12 text-base-content/60">
                No batches found
              </div>
            ) : (
              table.getRowModel().rows.map((row, index) => {
                const batch = row.original;
                const isExpanded = expandedRows.has(row.id);

                return (
                  <div
                    key={row.id}
                    className="border-b border-base-300 last:border-b-0 animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Collapsed Row */}
                    <div
                      className="p-4 hover:bg-base-200 transition-colors cursor-pointer"
                      onClick={() => toggleRowExpansion(row.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: Batch Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <MdSchool className="text-white text-lg" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base-content truncate">
                              {batch.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`badge badge-sm ${
                                  batch.status?.toLowerCase() === "active"
                                    ? "badge-success"
                                    : "badge-warning"
                                }`}
                              >
                                {batch.status || "Active"}
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
                        {/* Course */}
                        {batch.course && (
                          <div className="flex items-center gap-2 text-sm">
                            <MdSchool className="text-primary shrink-0" />
                            <span className="text-base-content/70">
                              {batch.course}
                            </span>
                          </div>
                        )}

                        {/* Schedule */}
                        {batch.schedule && (
                          <div className="flex items-center gap-2 text-sm">
                            <MdCalendarToday className="text-primary shrink-0" />
                            <span className="text-base-content/70">
                              {batch.schedule}
                            </span>
                          </div>
                        )}

                        {/* Total Students */}
                        {batch.totalStudents !== undefined && (
                          <div className="flex items-center gap-2 text-sm">
                            <MdPeople className="text-primary shrink-0" />
                            <span className="text-base-content/70">
                              {batch.totalStudents} Students
                            </span>
                          </div>
                        )}

                        {/* Fees */}
                        {batch.fees && (
                          <div className="flex items-center gap-2 text-sm">
                            <TbCurrencyTaka className="text-primary text-xl shrink-0" />
                            <span className="text-base-content/70">
                              ৳{batch.fees}
                            </span>
                          </div>
                        )}

                        {/* Start Date */}
                        {batch.startDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaClock className="text-primary shrink-0" />
                            <span className="text-base-content/70">
                              Started:{" "}
                              {new Date(batch.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(batch);
                            }}
                            className="btn btn-sm btn-primary gap-2 flex-1"
                          >
                            <MdEdit />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/batchManagement/batches/${batch._id}`);
                            }}
                            className="btn btn-sm btn-outline gap-2 flex-1"
                          >
                            <MdVisibility />
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(batch);
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
              })
            )}
          </div>

          {/* Pagination */}
          <div className="bg-base-200/50 px-6 py-4 border-t border-base-300/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/60">
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  batches.length
                )}{" "}
                of {batches.length} batches
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="btn btn-sm btn-ghost disabled:opacity-50"
                >
                  <MdNavigateBefore className="text-lg" />
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: table.getPageCount() }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => table.setPageIndex(i)}
                      className={`btn btn-sm ${
                        table.getState().pagination.pageIndex === i
                          ? "btn-primary"
                          : "btn-ghost"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="btn btn-sm btn-ghost disabled:opacity-50"
                >
                  Next
                  <MdNavigateNext className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Batch Modal */}
      {editModalOpen && (
        <div className="modal modal-open fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto relative z-[10000] bg-base-100">
            <form onSubmit={handleSubmit(onEditSubmit)}>
              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg">
                  <MdEdit className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-base-content">
                    Edit Batch
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Update batch information
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="btn btn-sm btn-circle btn-ghost ml-auto"
                  disabled={updateBatchMutation.isPending}
                >
                  <MdClose className="text-xl" />
                </button>
              </div>

              {/* Section 1: Basic Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                  <MdSchool className="text-primary" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Batch Name */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Batch Name
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <MdSchool />
                      </div>
                      <input
                        {...register("name", {
                          required: "Batch name is required",
                        })}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 ${
                          errors.name
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-base-300 focus:border-primary focus:ring-primary/20"
                        }`}
                        placeholder="Enter batch name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-error mt-1.5">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Course */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Course
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <MdBook />
                      </div>
                      <input
                        {...register("course", {
                          required: "Course name is required",
                        })}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 ${
                          errors.course
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-base-300 focus:border-primary focus:ring-primary/20"
                        }`}
                        placeholder="Enter course name"
                      />
                    </div>
                    {errors.course && (
                      <p className="text-xs text-error mt-1.5">
                        {errors.course.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Schedule Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                  <MdSchedule className="text-primary" />
                  Schedule Information
                </h4>
                <div className="space-y-4">
                  {/* Schedule Selector */}
                  <ScheduleSelector
                    daySchedules={daySchedules}
                    setDaySchedules={setDaySchedules}
                    formatSchedule={formatSchedule}
                  />

                  {/* Instructor */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Instructor
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <MdPerson />
                      </div>
                      <input
                        {...register("instructor")}
                        className="w-full border border-base-300 rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20"
                        placeholder="Enter instructor name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Capacity & Fees */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                  <MdPeople className="text-primary" />
                  Capacity & Fees
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Capacity */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Capacity
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <MdPeople />
                      </div>
                      <input
                        type="number"
                        {...register("capacity")}
                        className="w-full border border-base-300 rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20"
                        placeholder="Enter student capacity"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Fees */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Fees
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                        <TbCurrencyTaka />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        {...register("fees")}
                        className="w-full border border-base-300 rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20"
                        placeholder="Enter fees amount"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Dates & Status */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
                  <MdCalendarToday className="text-primary" />
                  Dates & Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Start Date
                    </label>
                    <Controller
                      control={control}
                      name="startDate"
                      render={({ field }) => (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 z-10 pointer-events-none">
                            <MdCalendarToday />
                          </div>
                          <DatePicker
                            selected={
                              field.value ? new Date(field.value) : startDate
                            }
                            onChange={(date) => {
                              setStartDate(date);
                              field.onChange(date?.toISOString());
                            }}
                            dateFormat="MMMM d, yyyy"
                            placeholderText="Select start date"
                            className="w-full border border-base-300 rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                          />
                        </div>
                      )}
                    />
                  </div>

                  {/* End Date */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      End Date
                    </label>
                    <Controller
                      control={control}
                      name="endDate"
                      render={({ field }) => (
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 z-10 pointer-events-none">
                            <MdEvent />
                          </div>
                          <DatePicker
                            selected={
                              field.value ? new Date(field.value) : endDate
                            }
                            onChange={(date) => {
                              setEndDate(date);
                              field.onChange(date?.toISOString());
                            }}
                            dateFormat="MMMM d, yyyy"
                            placeholderText="Select end date"
                            minDate={startDate}
                            className="w-full border border-base-300 rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                          />
                        </div>
                      )}
                    />
                  </div>

                  {/* Status */}
                  <div className="group md:col-span-2">
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Status
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 z-10">
                        <MdInfo />
                      </div>
                      <select
                        {...register("status", { required: true })}
                        className="w-full border border-base-300 rounded-xl pl-10 pr-10 py-3 bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20 transition-all duration-200 appearance-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-base-300">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="btn btn-ghost"
                  disabled={updateBatchMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateBatchMutation.isPending}
                  className="btn btn-primary text-white"
                >
                  {updateBatchMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <MdSave />
                      Update Batch
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Backdrop */}
          <div
            className="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={handleCloseEditModal}
          ></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal modal-open fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="modal-box relative z-[10000] bg-base-100">
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
                Delete Batch
              </h3>
            </div>

            <div className="py-4">
              <p className="text-base-content/80 mb-4">
                Are you sure you want to delete this batch? This action cannot
                be undone.
              </p>

              {batchToDelete && (
                <div className="bg-base-200 rounded-xl p-4 border border-base-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                      <MdSchool className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-base-content">
                        {batchToDelete.name}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {batchToDelete.course || "No course"}
                      </p>
                      <p className="text-xs text-base-content/60">
                        Instructor: {batchToDelete.instructor || "N/A"}
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
                    Deleting this batch will permanently remove all associated
                    students, attendance records, exams, exam results, and fee
                    records from the system.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={handleCancelDelete}
                className="btn btn-ghost"
                disabled={deleteBatchMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteBatchMutation.isPending}
                className="btn btn-error text-white"
              >
                {deleteBatchMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <MdDelete />
                    Delete Batch
                  </>
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={handleCancelDelete}
          ></div>
        </div>
      )}
    </div>
  );
};

/* Schedule Selector Component */
const ScheduleSelector = ({
  daySchedules,
  setDaySchedules,
  formatSchedule,
}) => {
  const daysOfWeek = [
    { name: "Sunday", abbr: "Sun" },
    { name: "Monday", abbr: "Mon" },
    { name: "Tuesday", abbr: "Tue" },
    { name: "Wednesday", abbr: "Wed" },
    { name: "Thursday", abbr: "Thu" },
    { name: "Friday", abbr: "Fri" },
    { name: "Saturday", abbr: "Sat" },
  ];

  const handleAddDay = (dayName) => {
    const existing = daySchedules.find(s => s.day === dayName);
    if (existing) return;

    // Default to 10:00 AM - 11:30 AM (24-hour format for HTML5 time input)
    setDaySchedules(prev => [
      ...prev,
      { day: dayName, startTime: "10:00", endTime: "11:30" }
    ]);
  };

  const handleRemoveDay = (dayName) => {
    setDaySchedules(prev => prev.filter(s => s.day !== dayName));
  };

  const handleUpdateTime = (dayName, field, value) => {
    setDaySchedules(prev =>
      prev.map(s => s.day === dayName ? { ...s, [field]: value } : s)
    );
  };

  const schedulePreview = formatSchedule(daySchedules);
  const selectedDays = daySchedules.map(s => s.day);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-base-content">
        Class Schedule
        <span className="text-error ml-1">*</span>
      </label>

      {/* Days Selection */}
      <div>
        <p className="text-xs text-base-content/60 mb-3">Select class days</p>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day.name}
              type="button"
              onClick={() =>
                selectedDays.includes(day.name)
                  ? handleRemoveDay(day.name)
                  : handleAddDay(day.name)
              }
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                selectedDays.includes(day.name)
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                  : "bg-base-200 text-base-content/70 hover:bg-base-300 hover:scale-105"
              }`}
            >
              <span className="hidden sm:inline">{day.name}</span>
              <span className="sm:hidden">{day.abbr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Day Schedules Table */}
      {daySchedules.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="bg-base-200">Day</th>
                <th className="bg-base-200">Start Time</th>
                <th className="bg-base-200">End Time</th>
                <th className="bg-base-200 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {daySchedules
                .sort((a, b) => {
                  const order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                  return order.indexOf(a.day) - order.indexOf(b.day);
                })
                .map((schedule) => (
                  <tr key={schedule.day} className="hover">
                    <td className="font-medium">{schedule.day}</td>
                    <td>
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) =>
                          handleUpdateTime(schedule.day, "startTime", e.target.value)
                        }
                        className="input input-bordered input-sm w-full max-w-xs"
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) =>
                          handleUpdateTime(schedule.day, "endTime", e.target.value)
                        }
                        className="input input-bordered input-sm w-full max-w-xs"
                      />
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(schedule.day)}
                        className="btn btn-ghost btn-sm btn-circle text-error"
                      >
                        <FaTimes />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Preview */}
      {schedulePreview && (
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-2">
            <MdCalendarToday className="text-primary" />
            <span className="text-sm text-base-content/70">Schedule preview:</span>
            <span className="font-semibold text-primary">{schedulePreview}</span>
          </div>
        </div>
      )}

      {/* Validation message */}
      {daySchedules.length === 0 && (
        <p className="text-xs text-base-content/50 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Please select days and set times to create schedule
        </p>
      )}
    </div>
  );
};

export default Batches;
