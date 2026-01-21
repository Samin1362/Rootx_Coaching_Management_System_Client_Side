import { useForm } from "react-hook-form";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdReceipt,
  MdPayment,
  MdDescription,
  MdPerson,
  MdDelete,
  MdEdit,
  MdCategory,
  MdDateRange,
} from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import {
  FaMoneyBillWave,
  FaUserTie,
  FaUsers,
  FaBolt,
  FaTools,
  FaBullhorn,
  FaHome,
  FaCar,
  FaEllipsisH,
} from "react-icons/fa";
import { useState } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";

const Expense = () => {
  const axiosSecure = useAxiosSecure();
  const notification = useNotification();
  const queryClient = useQueryClient();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      paymentMethod: "cash",
      category: "",
    },
  });

  // Expense templates
  const expenseTemplates = [
    {
      id: "teacher-salary",
      name: "Teacher Salary",
      icon: <FaUserTie className="text-3xl" />,
      category: "Salary",
      description: "Monthly salary for teaching staff",
      color: "primary",
    },
    {
      id: "staff-salary",
      name: "Staff Salary",
      icon: <FaUsers className="text-3xl" />,
      category: "Salary",
      description: "Monthly salary for administrative staff",
      color: "secondary",
    },
    {
      id: "utilities",
      name: "Utilities",
      icon: <FaBolt className="text-3xl" />,
      category: "Utilities",
      description: "Electricity, water, internet bills",
      color: "warning",
    },
    {
      id: "maintenance",
      name: "Maintenance",
      icon: <FaTools className="text-3xl" />,
      category: "Maintenance",
      description: "Building and equipment maintenance",
      color: "info",
    },
    {
      id: "marketing",
      name: "Marketing",
      icon: <FaBullhorn className="text-3xl" />,
      category: "Marketing",
      description: "Advertising and promotional expenses",
      color: "success",
    },
    {
      id: "rent",
      name: "Rent",
      icon: <FaHome className="text-3xl" />,
      category: "Rent",
      description: "Building or office rent",
      color: "error",
    },
    {
      id: "transportation",
      name: "Transportation",
      icon: <FaCar className="text-3xl" />,
      category: "Transportation",
      description: "Vehicle and travel expenses",
      color: "accent",
    },
    {
      id: "other",
      name: "Other",
      icon: <FaEllipsisH className="text-3xl" />,
      category: "Other",
      description: "Miscellaneous expenses",
      color: "neutral",
    },
  ];

  // Fetch all expenses
  const {
    data: expenses = [],
    isLoading: isLoadingExpenses,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await axiosSecure.get("/expenses");
      return res.data?.data || [];
    },
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData) => {
      const res = await axiosSecure.post("/expenses", expenseData);
      return res.data;
    },
    onSuccess: () => {
      notification.success("Expense added successfully!", "Success");
      reset({
        paymentMethod: "cash",
        category: "",
      });
      setSelectedTemplate(null);
      queryClient.invalidateQueries(["expenses"]);
    },
    onError: (error) => {
      notification.error(
        error.response?.data?.message || "Failed to add expense",
        "Error"
      );
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const res = await axiosSecure.patch(`/expenses/${id}`, updates);
      return res.data;
    },
    onSuccess: () => {
      notification.success("Expense updated successfully!", "Success");
      reset({
        paymentMethod: "cash",
        category: "",
      });
      setIsEditMode(false);
      setEditingExpenseId(null);
      setSelectedTemplate(null);
      queryClient.invalidateQueries(["expenses"]);
    },
    onError: (error) => {
      notification.error(
        error.response?.data?.message || "Failed to update expense",
        "Error"
      );
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/expenses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      notification.success("Expense deleted successfully!", "Success");
      queryClient.invalidateQueries(["expenses"]);
    },
    onError: (error) => {
      notification.error(
        error.response?.data?.message || "Failed to delete expense",
        "Error"
      );
    },
  });

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setValue("category", template.category);
    setValue("description", template.description);
    setIsEditMode(false);
    setEditingExpenseId(null);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const expenseData = {
        category: data.category,
        amount: parseFloat(data.amount),
        date: data.date,
        description: data.description || "",
        paymentMethod: data.paymentMethod,
        paidTo: data.paidTo || "",
        receiptNumber: data.receiptNumber || "",
        notes: data.notes || "",
      };

      if (isEditMode && editingExpenseId) {
        await updateExpenseMutation.mutateAsync({
          id: editingExpenseId,
          updates: expenseData,
        });
      } else {
        await createExpenseMutation.mutateAsync(expenseData);
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
    }
  };

  // Handle edit expense
  const handleEdit = (expense) => {
    setIsEditMode(true);
    setEditingExpenseId(expense._id);
    setValue("category", expense.category);
    setValue("amount", expense.amount);
    setValue("date", new Date(expense.date).toISOString().split("T")[0]);
    setValue("description", expense.description);
    setValue("paymentMethod", expense.paymentMethod);
    setValue("paidTo", expense.paidTo);
    setValue("receiptNumber", expense.receiptNumber);
    setValue("notes", expense.notes);

    // Find matching template
    const template = expenseTemplates.find(
      (t) => t.category === expense.category
    );
    if (template) {
      setSelectedTemplate(template);
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle delete expense
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingExpenseId(null);
    setSelectedTemplate(null);
    reset({
      paymentMethod: "cash",
      category: "",
    });
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  if (isLoadingExpenses) {
    return <Loader message="Loading expenses..." />;
  }

  return (
    <div className="min-h-screen bg-base-200/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <MdReceipt className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                Expense Management
              </h1>
              <p className="text-sm text-base-content/60 mt-1">
                Track and manage all coaching center expenses
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {/* Expense Templates */}
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300/50 p-6 mb-6">
              <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                <MdCategory className="text-primary" />
                Select Expense Type
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {expenseTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      selectedTemplate?.id === template.id
                        ? `border-${template.color} bg-${template.color}/10`
                        : "border-base-300 hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`flex flex-col items-center gap-2 ${
                        selectedTemplate?.id === template.id
                          ? `text-${template.color}`
                          : "text-base-content/70"
                      }`}
                    >
                      {template.icon}
                      <span className="text-xs font-semibold text-center">
                        {template.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Expense Form */}
            {selectedTemplate && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-base-300">
                    <h2 className="text-lg font-semibold text-base-content flex items-center gap-2">
                      <TbCurrencyTaka className="text-primary text-xl" />
                      {isEditMode ? "Edit Expense" : "Add New Expense"} -{" "}
                      {selectedTemplate.name}
                    </h2>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Category (Hidden, auto-filled) */}
                    <input
                      type="hidden"
                      {...register("category", {
                        required: "Category is required",
                      })}
                    />

                    {/* Amount & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Amount */}
                      <div>
                        <label className="block text-sm font-semibold text-base-content mb-2">
                          Amount <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <TbCurrencyTaka className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-lg" />
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Enter amount"
                            {...register("amount", {
                              required: "Amount is required",
                              min: {
                                value: 0.01,
                                message: "Amount must be greater than 0",
                              },
                            })}
                            className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 border-base-300"
                          />
                        </div>
                        {errors.amount && (
                          <p className="text-error text-xs mt-1">
                            {errors.amount.message}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div>
                        <label className="block text-sm font-semibold text-base-content mb-2">
                          Date <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <MdDateRange className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                          <input
                            type="date"
                            {...register("date", {
                              required: "Date is required",
                            })}
                            className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 border-base-300"
                          />
                        </div>
                        {errors.date && (
                          <p className="text-error text-xs mt-1">
                            {errors.date.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        Description
                      </label>
                      <div className="relative">
                        <MdDescription className="absolute left-3 top-3 text-base-content/40" />
                        <textarea
                          rows="3"
                          placeholder="Enter expense description"
                          {...register("description")}
                          className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 border-base-300 resize-none"
                        />
                      </div>
                    </div>

                    {/* Paid To & Receipt Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Paid To */}
                      <div>
                        <label className="block text-sm font-semibold text-base-content mb-2">
                          Paid To
                        </label>
                        <div className="relative">
                          <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                          <input
                            type="text"
                            placeholder="Person or company name"
                            {...register("paidTo")}
                            className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 border-base-300"
                          />
                        </div>
                      </div>

                      {/* Receipt Number */}
                      <div>
                        <label className="block text-sm font-semibold text-base-content mb-2">
                          Receipt Number
                        </label>
                        <div className="relative">
                          <MdReceipt className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                          <input
                            type="text"
                            placeholder="Receipt or invoice number"
                            {...register("receiptNumber")}
                            className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 border-base-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        Payment Method <span className="text-error">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {["cash", "bank", "card", "online"].map((method) => (
                          <label
                            key={method}
                            className="relative cursor-pointer"
                          >
                            <input
                              type="radio"
                              value={method}
                              {...register("paymentMethod")}
                              className="peer sr-only"
                            />
                            <div className="p-3 rounded-xl border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/10 transition-all duration-200 hover:border-primary/50">
                              <div className="flex items-center gap-2">
                                <MdPayment className="text-lg" />
                                <span className="text-sm font-semibold capitalize">
                                  {method}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-base-content mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Any additional notes or comments"
                        {...register("notes")}
                        className="w-full border rounded-xl px-4 py-3 bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 border-base-300 resize-none"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={
                          createExpenseMutation.isPending ||
                          updateExpenseMutation.isPending
                        }
                        className="flex-1 btn btn-primary text-white"
                      >
                        {createExpenseMutation.isPending ||
                        updateExpenseMutation.isPending ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            {isEditMode ? "Updating..." : "Adding..."}
                          </>
                        ) : (
                          <>
                            <TbCurrencyTaka className="text-lg" />
                            {isEditMode ? "Update Expense" : "Add Expense"}
                          </>
                        )}
                      </button>
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="btn btn-ghost"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Right Column - Summary & Recent Expenses */}
          <div className="space-y-6">
            {/* Total Expenses Card */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <FaMoneyBillWave className="text-3xl opacity-80" />
                <div>
                  <p className="text-sm opacity-90">Total Expenses</p>
                  <p className="text-3xl font-bold">
                    ৳{totalExpenses.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-xs opacity-75 mt-2">
                {expenses.length} expense{expenses.length !== 1 ? "s" : ""}{" "}
                recorded
              </p>
            </div>

            {/* Recent Expenses */}
            <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300/50 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-base-300">
                <h3 className="font-semibold text-base-content">
                  Recent Expenses
                </h3>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {expenses.length === 0 ? (
                  <div className="text-center py-8 text-base-content/60">
                    <MdReceipt className="text-4xl mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No expenses recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses.slice(0, 10).map((expense) => (
                      <div
                        key={expense._id}
                        className="p-3 rounded-xl border border-base-300 hover:border-primary/50 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="badge badge-primary badge-sm">
                                {expense.category}
                              </span>
                              <span className="text-xs text-base-content/60">
                                {new Date(expense.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-semibold text-base-content truncate">
                              ৳{expense.amount.toLocaleString()}
                            </p>
                            {expense.description && (
                              <p className="text-xs text-base-content/60 truncate">
                                {expense.description}
                              </p>
                            )}
                            {expense.paidTo && (
                              <p className="text-xs text-base-content/50">
                                Paid to: {expense.paidTo}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="btn btn-ghost btn-xs btn-square"
                              title="Edit"
                            >
                              <MdEdit className="text-info" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense._id)}
                              className="btn btn-ghost btn-xs btn-square"
                              title="Delete"
                            >
                              <MdDelete className="text-error" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expense;
