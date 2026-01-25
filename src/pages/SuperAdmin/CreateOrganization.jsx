import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { FaBuilding, FaArrowLeft, FaSave } from "react-icons/fa";

const CreateOrganization = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    ownerEmail: "",
    ownerName: "",
    phone: "",
    address: "",
    planId: "",
    trialDays: 14,
  });

  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axiosSecure.post("/super-admin/organizations", data);
      return response.data;
    },
    onSuccess: () => {
      navigate("/super-admin/organizations");
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Organization name is required";
    if (!formData.ownerEmail.trim()) newErrors.ownerEmail = "Owner email is required";
    if (formData.ownerEmail && !/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaBuilding className="text-primary" />
            Create Organization
          </h1>
          <p className="text-base-content/60 mt-1">Add a new organization to the platform</p>
        </div>
      </div>

      {/* Form */}
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Info Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Organization Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Organization Name *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input input-bordered ${errors.name ? "input-error" : ""}`}
                    placeholder="Enter organization name"
                  />
                  {errors.name && <span className="text-error text-sm mt-1">{errors.name}</span>}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Subdomain</span>
                  </label>
                  <input
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="e.g., mycompany"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Will be accessible at: {formData.subdomain || "subdomain"}.rootx.com
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Address</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="textarea textarea-bordered"
                    placeholder="Enter organization address"
                    rows={2}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* Owner Info Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Owner Email *</span>
                  </label>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    className={`input input-bordered ${errors.ownerEmail ? "input-error" : ""}`}
                    placeholder="owner@example.com"
                  />
                  {errors.ownerEmail && (
                    <span className="text-error text-sm mt-1">{errors.ownerEmail}</span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Owner Name</span>
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="input input-bordered"
                    placeholder="Enter owner name"
                  />
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* Subscription Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Subscription Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Initial Plan</span>
                  </label>
                  <select
                    name="planId"
                    value={formData.planId}
                    onChange={handleChange}
                    className="select select-bordered"
                  >
                    <option value="">Start with Trial</option>
                    <option value="basic">Basic Plan</option>
                    <option value="professional">Professional Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Trial Days</span>
                  </label>
                  <input
                    type="number"
                    name="trialDays"
                    value={formData.trialDays}
                    onChange={handleChange}
                    className="input input-bordered"
                    min="0"
                    max="90"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Number of days for the trial period (0 for no trial)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {createMutation.isError && (
              <div className="alert alert-error">
                <span>{createMutation.error?.response?.data?.message || "Failed to create organization"}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-1" /> Create Organization
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;
