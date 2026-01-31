import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  MdSchool,
  MdCalendarToday,
  MdPeople,
  MdAccessTime,
} from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";

const CreateBatches = () => {
  const axiosSecure = useAxiosSecure();
  const notification = useNotification();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [daySchedules, setDaySchedules] = useState([]);
  // Structure: [{ day: "Monday", startTime: "10:00", endTime: "11:30" }, ...]

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

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

  const onSubmit = async (data) => {
    const scheduleStr = formatSchedule(daySchedules);

    if (!scheduleStr) {
      notification.error("Please select schedule days and time");
      return;
    }

    const batch = {
      ...data,
      schedule: scheduleStr,
      fees: Number(data.fees),
      capacity: Number(data.capacity),
      status: data.status || "active",
    };

    try {
      const res = await axiosSecure.post("/batches", batch);

      if (res.data.success && res.data.data) {
        notification.success("Batch created successfully!");
        reset();
        setStartDate(null);
        setEndDate(null);
        setDaySchedules([]);
      }
    } catch (error) {
      notification.error(
        error.response?.data?.message || "Failed to create batch. Please try again.",
        "Error"
      );
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
                <div className="space-y-6">
                  <ScheduleSelector
                    daySchedules={daySchedules}
                    setDaySchedules={setDaySchedules}
                    formatSchedule={formatSchedule}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    label="Fees (৳)"
                    type="number"
                    placeholder="e.g., 15000"
                    required
                    icon={<TbCurrencyTaka className="text-lg" />}
                    error={errors.fees}
                    {...register("fees", {
                      required: "Fees amount is required",
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
                    setDaySchedules([]);
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
