import { useForm } from "react-hook-form";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNavigate } from "react-router";

const NewAdmissions = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    const admission = {
      ...data,
      createdBy: "admin", // replace with logged-in user id/email
    };

    try {
      const res = await axiosSecure.post("/admissions", admission);
      if (res.data.insertedId) {
        navigate("/dashboard/admissionManagement/admissions");
        reset();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create admission");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl mx-auto bg-base-100 p-6 rounded-xl shadow"
    >
      <h2 className="text-xl font-semibold text-neutral mb-6">
        New Admission
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Student Name"
          error={errors.name}
          {...register("name", { required: "Name is required" })}
        />

        <Input
          label="Phone Number"
          error={errors.phone}
          {...register("phone", { required: "Phone is required" })}
        />

        <Input
          label="Email (Optional)"
          type="email"
          {...register("email")}
        />

        <Input
          label="Interested Batch ID"
          error={errors.interestedBatchId}
          {...register("interestedBatchId", {
            required: "Batch ID is required",
          })}
        />
      </div>

      <div className="mt-6 text-right">
        <button type="submit" className="btn btn-primary px-8">
          Create Admission
        </button>
      </div>
    </form>
  );
};

export default NewAdmissions;

/* Reusable Input */
const Input = ({ label, error, ...rest }) => (
  <div>
    <label className="block text-sm font-medium text-neutral mb-1">
      {label}
    </label>
    <input
      {...rest}
      className={`input input-bordered w-full ${
        error ? "input-error" : ""
      }`}
    />
    {error && (
      <p className="text-xs text-error mt-1">{error.message}</p>
    )}
  </div>
);
