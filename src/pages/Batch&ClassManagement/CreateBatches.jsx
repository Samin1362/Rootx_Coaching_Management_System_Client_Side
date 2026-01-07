import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  MdSchool,
  MdCalendarToday,
  MdPeople,
  MdAttachMoney,
} from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";

const CreateBatches = () => {
  const axiosSecure = useAxiosSecure();
  const notification = useNotification();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    const batch = {
      ...data,
      totalFee: Number(data.totalFee),
      capacity: Number(data.capacity),
      status: data.status || "active",
    };

    try {
      const res = await axiosSecure.post("/batches", batch);

      if (res.data.insertedId) {
        notification.success("Batch created successfully!");
        reset();
        setStartDate(null);
        setEndDate(null);
      }
    } catch (error) {
      console.error(error);
      notification.error("Failed to create batch. Please try again.", "Error");
    }
  };

  return (
    <div className="min-h-screen bg-base-200/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <MdSchool className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                Create New Batch
              </h1>
              <p className="text-sm text-base-content/60 mt-1">
                Set up a new coaching batch with schedule and enrollment details
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300/50 overflow-hidden">
            {/* Form Content */}
            <div className="p-6 sm:p-8">
              {/* Basic Information Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MdSchool className="text-primary" />
                  </span>
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Batch Name"
                    placeholder="e.g., Spring 2025 - Physics"
                    required
                    error={errors.name}
                    {...register("name", {
                      required: "Batch name is required",
                    })}
                  />

                  <Input
                    label="Course"
                    placeholder="e.g., Advanced Mathematics"
                    required
                    error={errors.course}
                    {...register("course", { required: "Course is required" })}
                  />
                </div>
              </div>

              {/* Schedule & Timing Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <MdCalendarToday className="text-secondary" />
                  </span>
                  Schedule & Timing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Schedule"
                    placeholder="e.g., Sun–Thu 7–9 PM"
                    required
                    error={errors.schedule}
                    {...register("schedule", {
                      required: "Schedule is required",
                    })}
                  />

                  <DateInput
                    label="Start Date"
                    required
                    control={control}
                    name="startDate"
                    error={errors.startDate}
                    selectedDate={startDate}
                    onDateChange={setStartDate}
                    minDate={new Date()}
                    placeholder="Select batch start date"
                  />

                  <DateInput
                    label="End Date"
                    control={control}
                    name="endDate"
                    selectedDate={endDate}
                    onDateChange={setEndDate}
                    minDate={startDate || new Date()}
                    placeholder="Select batch end date (optional)"
                  />
                </div>
              </div>

              {/* Enrollment & Fees Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MdPeople className="text-primary" />
                  </span>
                  Enrollment & Fees
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Student Capacity"
                    type="number"
                    placeholder="e.g., 30"
                    required
                    icon={<MdPeople />}
                    error={errors.capacity}
                    {...register("capacity", {
                      required: "Capacity is required",
                      min: { value: 1, message: "Minimum 1 student required" },
                    })}
                  />

                  <Input
                    label="Total Fee (₹)"
                    type="number"
                    placeholder="e.g., 15000"
                    required
                    icon={<MdAttachMoney />}
                    error={errors.totalFee}
                    {...register("totalFee", {
                      required: "Total fee is required",
                      min: { value: 0, message: "Fee cannot be negative" },
                    })}
                  />

                  <SelectInput
                    label="Batch Status"
                    required
                    icon={<FaCheckCircle />}
                    {...register("status")}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "completed", label: "Completed" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-base-200/50 px-6 sm:px-8 py-4 border-t border-base-300/50">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="btn btn-ghost text-base-content order-2 sm:order-1"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-white px-8 order-1 sm:order-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <MdSchool className="text-lg" />
                  Create Batch
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBatches;

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
const SelectInput = ({ label, error, required, icon, options, ...rest }) => (
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
      <select
        {...rest}
        className={`w-full border rounded-xl ${
          icon ? "pl-10 pr-4" : "px-4"
        } py-3 bg-base-100 text-base-content transition-all duration-200 focus:outline-none focus:ring-2 border-base-300 focus:border-primary focus:ring-primary/20 hover:border-base-content/30 appearance-none cursor-pointer`}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
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

/* Date Picker Component */
const DateInput = ({
  label,
  required,
  control,
  name,
  error,
  selectedDate,
  onDateChange,
  minDate,
  placeholder,
}) => (
  <div className="group">
    <label className="block text-sm font-semibold text-base-content mb-2">
      {label}
      {required && <span className="text-error ml-1">*</span>}
    </label>
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field }) => (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors z-10 pointer-events-none">
            <MdCalendarToday />
          </div>
          <DatePicker
            selected={field.value ? new Date(field.value) : selectedDate}
            onChange={(date) => {
              onDateChange(date);
              field.onChange(date?.toISOString());
            }}
            dateFormat="MMMM d, yyyy"
            placeholderText={placeholder}
            minDate={minDate}
            className="w-full border rounded-xl pl-10 pr-4 py-3 bg-base-100 text-base-content border-base-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-base-content/30 transition-all duration-200"
            calendarClassName="custom-datepicker"
            wrapperClassName="w-full"
          />
        </div>
      )}
    />
    {error && (
      <p className="text-xs text-error mt-1.5 flex items-center gap-1">
        <span>⚠</span>
        {error.message}
      </p>
    )}
  </div>
);
