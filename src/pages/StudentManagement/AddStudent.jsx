import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSchool,
  MdCalendarToday,
  MdImage,
} from "react-icons/md";
import {
  FaUserGraduate,
  FaUserTie,
  FaCheckCircle,
  FaMale,
  FaFemale,
  FaUsers,
} from "react-icons/fa";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const AddStudent = () => {
  const axiosSecure = useAxiosSecure();
  const [imageUrl, setImageUrl] = useState("");
  const [dob, setDob] = useState(null);
  const [admissionDate, setAdmissionDate] = useState(null);
  const widgetRef = useRef();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  /* Fetch batches */
  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await axiosSecure.get("/batches");
      return res.data;
    },
  });

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

  const onSubmit = async (data) => {
    const student = {
      ...data,
      image: imageUrl,
      status: data.status || "active",
    };

    try {
      const res = await axiosSecure.post("/students", student);
      if (res.data.insertedId) {
        alert("Student added successfully");
        reset();
        setImageUrl("");
        setDob(null);
        setAdmissionDate(null);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add student");
    }
  };

  return (
    <div className="min-h-screen bg-base-200/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <FaUserGraduate className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-base-content">
                Add New Student
              </h1>
              <p className="text-sm text-base-content/60 mt-1">
                Register a new student with complete information and documents
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300/50 overflow-hidden">
            {/* Form Content */}
            <div className="p-6 sm:p-8">
              {/* Personal Information Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MdPerson className="text-primary" />
                  </span>
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    placeholder="e.g., John Doe"
                    required
                    icon={<MdPerson />}
                    error={errors.name}
                    {...register("name", {
                      required: "Student name is required",
                    })}
                  />

                  <SelectInput
                    label="Gender"
                    required
                    icon={<BsGenderMale />}
                    error={errors.gender}
                    {...register("gender", { required: "Gender is required" })}
                    options={[
                      { value: "", label: "Select Gender" },
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                    ]}
                  />

                  <DateInput
                    label="Date of Birth"
                    required
                    control={control}
                    name="dob"
                    error={errors.dob}
                    selectedDate={dob}
                    onDateChange={setDob}
                    maxDate={new Date()}
                    placeholder="Select date of birth"
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

                  <Input
                    label="Address"
                    placeholder="e.g., 123 Main Street, City"
                    icon={<MdLocationOn />}
                    {...register("address")}
                  />
                </div>
              </div>

              {/* Guardian Information Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <FaUserTie className="text-secondary" />
                  </span>
                  Guardian Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Guardian Name"
                    placeholder="e.g., Parent/Guardian Name"
                    icon={<FaUserTie />}
                    {...register("guardianName")}
                  />

                  <Input
                    label="Guardian Phone"
                    type="tel"
                    placeholder="e.g., +880 1234 567890"
                    icon={<MdPhone />}
                    {...register("guardianPhone")}
                  />
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MdSchool className="text-primary" />
                  </span>
                  Academic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input
                    label="Previous Institution"
                    placeholder="e.g., ABC School"
                    icon={<MdSchool />}
                    {...register("previousInstitute")}
                  />

                  <SelectInput
                    label="Batch"
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
                        label: `${batch.name} — ${batch.course} (${batch.schedule})`,
                      })),
                    ]}
                    disabled={isLoadingBatches}
                  />

                  <DateInput
                    label="Admission Date"
                    control={control}
                    name="admissionDate"
                    selectedDate={admissionDate}
                    onDateChange={setAdmissionDate}
                    maxDate={new Date()}
                    placeholder="Select admission date"
                  />

                  <SelectInput
                    label="Student Status"
                    required
                    icon={<FaCheckCircle />}
                    {...register("status")}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                      { value: "suspended", label: "Suspended" },
                    ]}
                  />
                </div>
              </div>

              {/* Student Image Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <MdImage className="text-secondary" />
                  </span>
                  Student Photo
                </h2>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-base-200/50 rounded-xl border border-base-300/50">
                  {imageUrl ? (
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-primary shadow-lg">
                        <img
                          src={imageUrl}
                          alt="Student"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-error text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-base-300/50 rounded-xl border-2 border-dashed border-base-content/20 flex items-center justify-center">
                      <MdImage className="text-4xl text-base-content/30" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-base-content mb-2">
                      Upload Student Photo
                    </h3>
                    <p className="text-xs text-base-content/60 mb-4">
                      Upload a clear photo of the student. Accepted formats:
                      JPG, PNG (max 5MB)
                    </p>
                    <button
                      type="button"
                      onClick={() => widgetRef.current?.open()}
                      className="btn btn-outline btn-primary btn-sm"
                    >
                      <MdImage className="text-lg" />
                      {imageUrl ? "Change Photo" : "Upload Photo"}
                    </button>
                  </div>
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
                    setImageUrl("");
                    setDob(null);
                    setAdmissionDate(null);
                  }}
                  className="btn btn-ghost text-base-content order-2 sm:order-1"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-white px-8 order-1 sm:order-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <FaUserGraduate className="text-lg" />
                  Add Student
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;

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
  maxDate,
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
            maxDate={maxDate}
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
