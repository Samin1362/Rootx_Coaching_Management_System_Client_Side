import { useForm } from "react-hook-form";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdSchool,
  MdPersonAdd,
} from "react-icons/md";
import { FaUserPlus, FaUsers, FaCheckCircle } from "react-icons/fa";
import { useNotification } from "../../contexts/NotificationContext";

const NewAdmissions = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const notification = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  /* Fetch active batches */
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["active-batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches?status=active");
      return res.data;
    },
  });

  const onSubmit = async (data) => {
    const admission = {
      ...data,
      createdBy: "admin", // replace later with logged-in user
    };

    try {
      const res = await axiosSecure.post("/admissions", admission);
      if (res.data.insertedId) {
        notification.success("Admission created successfully!");
        navigate("/dashboard/admissionManagement/admissions");
        reset();
      }
    } catch (error) {
      console.error(error);
      notification.error("Failed to create admission. Please try again.", "Error");
    }
  };

  return (
    <div className="min-h-screen bg-base-200/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <FaUserPlus className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                New Admission Request
              </h1>
              <p className="text-sm text-base-content/60 mt-1">
                Register a prospective student's interest in joining a batch
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300/50 overflow-hidden">
            {/* Form Content */}
            <div className="p-6 sm:p-8">
              {/* Prospective Student Information */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MdPerson className="text-primary" />
                  </span>
                  Prospective Student Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Student Name"
                    placeholder="e.g., John Doe"
                    required
                    icon={<MdPerson />}
                    error={errors.name}
                    {...register("name", {
                      required: "Student name is required",
                    })}
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="e.g., +880 1234 567890"
                    required
                    icon={<MdPhone />}
                    error={errors.phone}
                    {...register("phone", {
                      required: "Phone number is required",
                    })}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g., student@example.com"
                    icon={<MdEmail />}
                    {...register("email")}
                  />
                </div>
              </div>

              {/* Batch Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <MdSchool className="text-secondary" />
                  </span>
                  Batch Preference
                </h2>

                <SelectInput
                  label="Interested Batch"
                  required
                  icon={<FaUsers />}
                  error={errors.interestedBatchId}
                  {...register("interestedBatchId", {
                    required: "Please select a batch",
                  })}
                  options={[
                    {
                      value: "",
                      label: isLoading
                        ? "Loading batches..."
                        : "Select a batch",
                    },
                    ...batches.map((batch) => ({
                      value: batch._id,
                      label: `${batch.name} — ${batch.schedule}`,
                    })),
                  ]}
                  disabled={isLoading}
                />

                {/* Active Batches Info */}
                {batches.length > 0 && (
                  <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center shrink-0">
                        <FaCheckCircle className="text-info" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-base-content mb-1">
                          {batches.length} Active Batch
                          {batches.length > 1 ? "es" : ""} Available
                        </h4>
                        <p className="text-xs text-base-content/60">
                          Choose the batch that best fits the student's schedule
                          and learning goals. You can follow up with this
                          admission later.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {batches.length === 0 && !isLoading && (
                  <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center shrink-0">
                        <MdSchool className="text-warning" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-base-content mb-1">
                          No Active Batches
                        </h4>
                        <p className="text-xs text-base-content/60">
                          There are currently no active batches available.
                          Please create a batch first before adding admissions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-base-200/50 px-6 sm:px-8 py-4 border-t border-base-300/50">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                  }}
                  className="btn btn-ghost text-base-content order-2 sm:order-1"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={isLoading || batches.length === 0}
                  className="btn btn-primary text-white px-8 order-1 sm:order-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaUserPlus className="text-lg" />
                  Create Admission
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAdmissions;

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
