import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const AddStudent = () => {
  const axiosSecure = useAxiosSecure();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [imageUrl, setImageUrl] = useState("");
  const widgetRef = useRef();

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

  const onSubmit = (data) => {
    const student = {
      ...data,
      image: imageUrl,
      status: data.status || "active",
      admissionDate: data.admissionDate || new Date(),
    };

    axiosSecure.post("/students", student).then((res) => {
      if (res.data.insertedId) {
        alert("Student added");
      }
    });

    reset();
    setImageUrl("");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Name"
          error={errors.name}
          {...register("name", { required: "Name is required" })}
        />

        <Input label="Gender" {...register("gender")} />

        <Input label="Date of Birth" type="date" {...register("dob")} />

        <Input
          label="Phone"
          error={errors.phone}
          {...register("phone", { required: "Phone is required" })}
        />

        <Input label="Email" type="email" {...register("email")} />

        <Input label="Address" {...register("address")} />

        <Input label="Guardian Name" {...register("guardianName")} />

        <Input label="Guardian Phone" {...register("guardianPhone")} />

        <Input label="Institution" {...register("previousInstitute")} />

        <Input
          label="Batch ID"
          error={errors.batchId}
          {...register("batchId", { required: "Batch ID is required" })}
        />

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            {...register("status")}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <Input
          label="Admission Date"
          type="date"
          {...register("admissionDate")}
        />

        {/* Image Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student Image
          </label>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => widgetRef.current?.open()}
              className="px-4 py-2 border border-gray-800 rounded-md hover:bg-gray-800 hover:text-white transition"
            >
              Upload Image
            </button>

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Student"
                className="w-16 h-16 rounded-md object-cover border"
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-right">
        <button
          type="submit"
          className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
        >
          Add Student
        </button>
      </div>
    </form>
  );
};

export default AddStudent;

const Input = ({ label, error, ...rest }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      {...rest}
      className={`w-full border rounded-md px-3 py-2 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
);
