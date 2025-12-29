import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "react-icons/md";
import {
  FaUserGraduate,
  FaCheckCircle,
  FaClock,
  FaUserTie,
} from "react-icons/fa";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Students = () => {
  const axiosSecure = useAxiosSecure();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data;
    },
  });

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
          <div className="flex items-center gap-3 min-w-[200px]">
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
          <div className="flex items-center gap-2 text-sm max-w-[200px]">
            <MdLocationOn className="text-base-content/40 shrink-0" />
            <span className="text-base-content truncate">{getValue()}</span>
          </div>
        ),
      },
      {
        accessorKey: "guardianName",
        header: "Guardian",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-[150px]">
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
        cell: ({ getValue }) => (
          <div className="badge badge-outline badge-primary font-medium">
            {getValue()}
          </div>
        ),
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
        cell: () => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-ghost btn-square hover:bg-primary/10 hover:text-primary transition-all duration-200"
              title="View Details"
            >
              <MdVisibility className="text-lg" />
            </button>
            <button
              className="btn btn-sm btn-ghost btn-square hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
              title="Edit Student"
            >
              <MdEdit className="text-lg" />
            </button>
            <button
              className="btn btn-sm btn-ghost btn-square hover:bg-error/10 hover:text-error transition-all duration-200"
              title="Delete Student"
            >
              <MdDelete className="text-lg" />
            </button>
          </div>
        ),
      },
    ],
    []
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
        {(statusFilter !== "all" || genderFilter !== "all" || globalFilter) && (
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
        <div className="overflow-x-auto">
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
                            {header.column.getIsSorted() === "asc" ? "↑" : "↓"}
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
                {Array.from({ length: table.getPageCount() }, (_, i) => i).map(
                  (pageIndex) => {
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
                  }
                )}
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
  );
};

export default Students;
