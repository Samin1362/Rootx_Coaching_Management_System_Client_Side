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
  MdAttachMoney,
} from "react-icons/md";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const Batches = () => {
  const axiosSecure = useAxiosSecure();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data;
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
        accessorKey: "totalFee",
        header: "Fee",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <MdAttachMoney className="text-secondary text-sm" />
            </div>
            <span className="font-semibold text-base-content">
              ₹{getValue()?.toLocaleString()}
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
              className="btn btn-sm btn-ghost text-primary hover:bg-primary/10 transition-all duration-200"
              title="View Details"
            >
              <MdVisibility />
            </button>
            <button
              className="btn btn-sm btn-ghost text-secondary hover:bg-secondary/10 transition-all duration-200"
              title="Edit Batch"
            >
              <MdEdit />
            </button>
            {row.original.status === "active" && (
              <button
                className="btn btn-sm btn-ghost text-warning hover:bg-warning/10 transition-all duration-200"
                title="Mark Complete"
              >
                <MdCheckCircle />
              </button>
            )}
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-base-content/60">Loading batches...</p>
        </div>
      </div>
    );
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
          <div className="overflow-x-auto">
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
    </div>
  );
};

export default Batches;
