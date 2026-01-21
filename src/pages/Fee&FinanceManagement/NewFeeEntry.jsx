import { useForm } from "react-hook-form";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import {
  MdPerson,
  MdPhone,
  MdPayment,
  MdSearch,
  MdClose,
} from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import { FaMoneyBillWave, FaUsers, FaCheckCircle } from "react-icons/fa";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";

const NewFeeEntry = () => {
  const axiosSecure = useAxiosSecure();
  const notification = useNotification();

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentSearchRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      paymentMethod: "cash",
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        studentSearchRef.current &&
        !studentSearchRef.current.contains(event.target)
      ) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* Fetch students */
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await axiosSecure.get("/students");
      return res.data.data || [];
    },
  });

  /* Fetch active batches */
  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ["active-batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches?status=active");
      return res.data.data || [];
    },
  });

  /* Fetch existing fee entries */
  const { data: feeEntries = [], isLoading: isLoadingFees } = useQuery({
    queryKey: ["fee-entries"],
    queryFn: async () => {
      const res = await axiosSecure.get("/fees");
      return res.data.data || [];
    },
  });

  const paidAmount = watch("paidAmount");
  const selectedBatchId = watch("batchId");

  // Get total fee from selected batch
  const selectedBatch = useMemo(() => {
    if (!selectedBatchId) return null;
    return batches.find((batch) => batch._id === selectedBatchId);
  }, [selectedBatchId, batches]);

  const fees = selectedBatch?.fees || 0;

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const searchLower = studentSearch.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchLower) ||
        student.phone.includes(studentSearch)
    );
  }, [students, studentSearch]);

  // Check if student already has a fee entry
  const hasExistingFeeEntry = (studentId) => {
    return feeEntries.some((entry) => entry.studentId === studentId);
  };

  // Handle student selection
  const handleStudentSelect = (student) => {
    // Check if student already has a fee entry
    if (hasExistingFeeEntry(student._id)) {
      notification.error(
        `${student.name} already has a fee entry. Please edit the existing entry instead.`,
        "Duplicate Entry"
      );
      return;
    }

    setSelectedStudent(student);
    setStudentSearch(student.name);
    setShowStudentDropdown(false);
    setValue("studentId", student._id);

    // Auto-select the student's batch if available
    if (student.batchId) {
      setValue("batchId", student.batchId);
    }
  };

  // Handle student search input
  const handleStudentSearchChange = (e) => {
    const value = e.target.value;
    setStudentSearch(value);
    setShowStudentDropdown(true);
    if (!value) {
      setSelectedStudent(null);
      setValue("studentId", "");
    }
  };

  // Clear student selection
  const handleClearStudent = () => {
    setStudentSearch("");
    setSelectedStudent(null);
    setShowStudentDropdown(false);
    setValue("studentId", "");
  };

  // No need for handleBatchChange anymore - total fee is automatic

  const onSubmit = async (data) => {
    // Validate that batch is selected (which provides fees)
    if (!selectedBatch || !fees) {
      notification.warning(
        "Please select a batch with a valid fee",
        "Missing Information"
      );
      return;
    }

    const feeEntry = {
      studentId: data.studentId,
      batchId: data.batchId,
      fees: Number(fees), // Use fees from selected batch
      paidAmount: data.paidAmount ? Number(data.paidAmount) : 0,
      paymentMethod: data.paymentMethod,
    };

    try {
      const res = await axiosSecure.post("/fees", feeEntry);
      if (res.data.insertedId) {
        notification.success("Fee entry created successfully!");
        reset();
        // Clear student search state
        setStudentSearch("");
        setSelectedStudent(null);
        setShowStudentDropdown(false);
      }
    } catch (error) {
      console.error(error);
      notification.error(
        "Failed to create fee entry. Please try again.",
        "Error"
      );
    }
  };

  const handleResetForm = () => {
    reset({ paymentMethod: "cash" });
    setStudentSearch("");
    setSelectedStudent(null);
    setShowStudentDropdown(false);
  };

  const isLoading = isLoadingStudents || isLoadingBatches || isLoadingFees;
  const isDataReady = students.length > 0 && batches.length > 0;

  return (
    <div className="min-h-screen bg-base-200/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <FaMoneyBillWave className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                New Fee Entry
              </h1>
              <p className="text-sm text-base-content/60 mt-1">
                Record fee payment for a student enrolled in a batch
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300/50 overflow-hidden">
            {/* Form Content */}
            <div className="p-6 sm:p-8">
              {/* Student & Batch Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MdPerson className="text-primary" />
                  </span>
                  Student & Batch Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Search Input */}
                  <div className="group relative" ref={studentSearchRef}>
                    <label className="block text-sm font-semibold text-base-content mb-2">
                      Search Student
                      <span className="text-error ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors">
                        <MdSearch />
                      </div>
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={handleStudentSearchChange}
                        onFocus={() => setShowStudentDropdown(true)}
                        placeholder={
                          isLoadingStudents
                            ? "Loading students..."
                            : "Search by name or phone..."
                        }
                        disabled={isLoadingStudents}
                        className={`w-full border rounded-xl pl-10 ${
                          selectedStudent ? "pr-10" : "pr-4"
                        } py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 ${
                          errors.studentId
                            ? "border-error focus:border-error focus:ring-error/20"
                            : "border-base-300 focus:border-primary focus:ring-primary/20 hover:border-base-content/30"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      {selectedStudent && (
                        <button
                          type="button"
                          onClick={handleClearStudent}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-error transition-colors"
                        >
                          <MdClose className="text-lg" />
                        </button>
                      )}
                      {/* Hidden input for form validation */}
                      <input
                        type="hidden"
                        {...register("studentId", {
                          required: "Please select a student",
                        })}
                      />
                    </div>

                    {/* Selected Student Badge */}
                    {selectedStudent && (
                      <div className="mt-2 p-2 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2">
                        <FaCheckCircle className="text-success text-sm" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="badge badge-primary badge-xs font-bold">
                              #{selectedStudent.roll || "N/A"}
                            </span>
                            <p className="text-xs font-semibold text-base-content">
                              {selectedStudent.name}
                            </p>
                          </div>
                          <p className="text-xs text-base-content/60">
                            {selectedStudent.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Dropdown Results */}
                    {showStudentDropdown &&
                      studentSearch &&
                      !selectedStudent && (
                        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                          {isLoadingStudents ? (
                            <div className="p-4">
                              <Loader
                                size="sm"
                                fullScreen={false}
                                message="Loading students..."
                              />
                            </div>
                          ) : filteredStudents.length > 0 ? (
                            <ul>
                              {filteredStudents.map((student) => {
                                const hasFeeEntry = hasExistingFeeEntry(
                                  student._id
                                );
                                return (
                                  <li key={student._id}>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStudentSelect(student)
                                      }
                                      disabled={hasFeeEntry}
                                      className={`w-full text-left px-4 py-3 transition-colors border-b border-base-300 last:border-b-0 ${
                                        hasFeeEntry
                                          ? "opacity-50 cursor-not-allowed bg-base-200"
                                          : "hover:bg-primary/10"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                          <MdPerson className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="badge badge-primary badge-xs font-bold">
                                              #{student.roll || "N/A"}
                                            </span>
                                            <p className="text-sm font-semibold text-base-content">
                                              {student.name}
                                            </p>
                                            {hasFeeEntry && (
                                              <span className="badge badge-success badge-xs">
                                                Already Enrolled
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xs text-base-content/60">
                                            {student.phone}
                                          </p>
                                        </div>
                                      </div>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <div className="p-4 text-center text-base-content/60">
                              <MdPerson className="text-3xl mx-auto mb-2 opacity-40" />
                              <p className="text-xs">No students found</p>
                              <p className="text-xs mt-1">
                                Try a different search term
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                    {errors.studentId && (
                      <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                        <span>⚠</span>
                        {errors.studentId.message}
                      </p>
                    )}
                  </div>

                  <SelectInput
                    label="Select Batch"
                    required
                    icon={<FaUsers />}
                    error={errors.batchId}
                    {...register("batchId", {
                      required: "Please select a batch",
                    })}
                    options={[
                      {
                        value: "",
                        label: isLoadingBatches
                          ? "Loading batches..."
                          : "Select a batch",
                      },
                      ...batches.map((batch) => ({
                        value: batch._id,
                        label: `${batch.name} — ${batch.course} — ${
                          batch.schedule
                        } — ৳${batch.fees?.toLocaleString() || "N/A"}`,
                      })),
                    ]}
                    disabled={isLoadingBatches}
                  />
                </div>

                {/* Display Total Fee from Selected Batch */}
                {selectedBatch && (
                  <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm">
                        <TbCurrencyTaka className="text-primary text-2xl" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-base-content mb-1">
                          Batch Fee Information
                        </h4>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-base-content/60">
                            Total Fee for {selectedBatch.name}:
                          </span>
                          <span className="text-2xl font-bold text-primary">
                            ৳{fees.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/50 mt-1">
                          This fee is automatically set based on the selected
                          batch
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Status Info */}
                {!isLoading && !isDataReady && (
                  <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center shrink-0">
                        <MdPerson className="text-warning" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-base-content mb-1">
                          Missing Required Data
                        </h4>
                        <p className="text-xs text-base-content/60">
                          {students.length === 0 &&
                            "No students found. Please add students first. "}
                          {batches.length === 0 &&
                            "No active batches found. Please create an active batch first."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Student Search Info */}
                {students.length > 0 && !selectedStudent && (
                  <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center shrink-0">
                        <MdSearch className="text-info" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-base-content mb-1">
                          {students.length} Student
                          {students.length > 1 ? "s" : ""} Available
                        </h4>
                        <p className="text-xs text-base-content/60">
                          Start typing to search by student name or phone number
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <FaMoneyBillWave className="text-secondary" />
                  </span>
                  Payment Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Paid Amount"
                    type="number"
                    placeholder="e.g., 5000 (optional)"
                    icon={<FaMoneyBillWave />}
                    error={errors.paidAmount}
                    {...register("paidAmount", {
                      min: { value: 0, message: "Amount cannot be negative" },
                      validate: (value) => {
                        if (
                          value &&
                          fees &&
                          Number(value) > Number(fees)
                        ) {
                          return "Paid amount cannot exceed total fee";
                        }
                        return true;
                      },
                    })}
                  />
                </div>

                {/* Fee Summary */}
                {selectedBatch && fees > 0 && (
                  <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center shrink-0">
                        <FaCheckCircle className="text-info" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-base-content mb-2">
                          Fee Summary
                        </h4>
                        <div className="space-y-1 text-xs text-base-content/70">
                          <div className="flex justify-between">
                            <span>Total Fee:</span>
                            <span className="font-semibold">
                              ৳{Number(fees).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Paid Amount:</span>
                            <span className="font-semibold text-success">
                              $
                              {paidAmount
                                ? Number(paidAmount).toLocaleString()
                                : "0"}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-info/20">
                            <span>Due Amount:</span>
                            <span className="font-semibold text-warning">
                              ৳
                              {(
                                Number(fees) - (Number(paidAmount) || 0)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MdPayment className="text-primary" />
                  </span>
                  Payment Method
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="relative cursor-pointer">
                    <input
                      type="radio"
                      value="cash"
                      {...register("paymentMethod")}
                      className="peer sr-only"
                    />
                    <div className="p-4 border-2 border-base-300 rounded-xl transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                          <FaMoneyBillWave className="text-success text-lg" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base-content">
                            Cash Payment
                          </h3>
                          <p className="text-xs text-base-content/60">
                            Payment received in cash
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className="relative cursor-pointer">
                    <input
                      type="radio"
                      value="online"
                      {...register("paymentMethod")}
                      className="peer sr-only"
                    />
                    <div className="p-4 border-2 border-base-300 rounded-xl transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                          <MdPayment className="text-info text-lg" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base-content">
                            Online Payment
                          </h3>
                          <p className="text-xs text-base-content/60">
                            Payment via UPI, card, or bank transfer
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-base-200/50 px-6 sm:px-8 py-4 border-t border-base-300/50">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="btn btn-ghost text-base-content order-2 sm:order-1"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isDataReady}
                  className="btn btn-primary text-white px-8 order-1 sm:order-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaMoneyBillWave className="text-lg" />
                  Create Fee Entry
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFeeEntry;

/* Reusable Input Component with Icon Support */
const Input = ({ label, error, required, icon, ...rest }) => (
  <div className="group">
    <label className="block text-sm font-semibold text-base-content mb-2">
      {label}
      {required && <span className="text-error ml-1">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors">
          {icon}
        </div>
      )}
      <input
        {...rest}
        className={`w-full border rounded-xl ${
          icon ? "pl-10 pr-4" : "px-4"
        } py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 ${
          error
            ? "border-error focus:border-error focus:ring-error/20"
            : "border-base-300 focus:border-primary focus:ring-primary/20 hover:border-base-content/30"
        }`}
      />
    </div>
    {error && (
      <p className="text-xs text-error mt-1.5 flex items-center gap-1">
        <span>⚠</span>
        {error.message}
      </p>
    )}
  </div>
);

/* Select Input Component */
const SelectInput = ({
  label,
  error,
  required,
  icon,
  options,
  disabled,
  ...rest
}) => (
  <div className="group">
    <label className="block text-sm font-semibold text-base-content mb-2">
      {label}
      {required && <span className="text-error ml-1">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors z-10">
          {icon}
        </div>
      )}
      <select
        {...rest}
        disabled={disabled}
        className={`w-full border rounded-xl ${
          icon ? "pl-10 pr-10" : "px-4 pr-10"
        } py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 ${
          error
            ? "border-error focus:border-error focus:ring-error/20"
            : "border-base-300 focus:border-primary focus:ring-primary/20 hover:border-base-content/30"
        } appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {options?.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-base-content/40">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
    {error && (
      <p className="text-xs text-error mt-1.5 flex items-center gap-1">
        <span>⚠</span>
        {error.message}
      </p>
    )}
  </div>
);
