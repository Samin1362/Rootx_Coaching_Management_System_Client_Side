import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaCrown,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
} from "react-icons/fa";

const PlansList = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [],
    limits: {
      maxUsers: 10,
      maxStudents: 100,
      maxBatches: 5,
      maxStorage: 1,
    },
    isPopular: false,
    isActive: true,
  });

  // Fetch plans
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ["super-admin-plans"],
    queryFn: async () => {
      const response = await axiosSecure.get("/super-admin/plans");
      return response.data.data;
    },
  });

  // Create plan mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      return axiosSecure.post("/super-admin/plans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-plans"]);
      setShowCreateModal(false);
      resetForm();
    },
  });

  // Update plan mutation
  const updateMutation = useMutation({
    mutationFn: async ({ planId, data }) => {
      return axiosSecure.put(`/super-admin/plans/${planId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-plans"]);
      setShowEditModal(false);
      setSelectedPlan(null);
      resetForm();
    },
  });

  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: async (planId) => {
      return axiosSecure.delete(`/super-admin/plans/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-plans"]);
      setShowDeleteModal(false);
      setSelectedPlan(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: { monthly: 0, yearly: 0 },
      features: [],
      limits: { maxUsers: 10, maxStudents: 100, maxBatches: 5, maxStorage: 1 },
      isPopular: false,
      isActive: true,
    });
  };

  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name || "",
      description: plan.description || "",
      price: plan.price || { monthly: 0, yearly: 0 },
      features: plan.features || [],
      limits: plan.limits || { maxUsers: 10, maxStudents: 100, maxBatches: 5, maxStorage: 1 },
      isPopular: plan.isPopular || false,
      isActive: plan.isActive !== false,
    });
    setShowEditModal(true);
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading plans: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FaCrown className="text-primary" />
            Subscription Plans
          </h1>
          <p className="text-base-content/60 mt-1">Manage subscription plans and pricing</p>
        </div>
        <button className="btn btn-primary btn-sm sm:btn-md" onClick={() => setShowCreateModal(true)}>
          <FaPlus className="mr-1" /> New Plan
        </button>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <div
              key={plan._id}
              className={`card bg-base-100 shadow-lg border-2 ${
                plan.isPopular ? "border-primary" : "border-base-300"
              } relative`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-primary gap-1">
                    <FaStar className="text-xs" /> Popular
                  </span>
                </div>
              )}
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">{plan.name}</h2>
                  <span className={`badge ${plan.isActive ? "badge-success" : "badge-ghost"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-base-content/60 text-sm">{plan.description}</p>

                {/* Pricing */}
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${plan.price?.monthly || 0}</span>
                    <span className="text-base-content/60">/month</span>
                  </div>
                  <p className="text-sm text-base-content/60">
                    or ${plan.price?.yearly || 0}/year
                  </p>
                </div>

                {/* Limits */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Max Users</span>
                    <span className="font-medium">{plan.limits?.maxUsers || "Unlimited"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Students</span>
                    <span className="font-medium">{plan.limits?.maxStudents || "Unlimited"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Batches</span>
                    <span className="font-medium">{plan.limits?.maxBatches || "Unlimited"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span className="font-medium">{plan.limits?.maxStorage || 1} GB</span>
                  </div>
                </div>

                {/* Features */}
                <div className="divider my-2"></div>
                <ul className="space-y-2">
                  {plan.features?.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <FaCheckCircle className="text-success shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.features?.length > 5 && (
                    <li className="text-sm text-base-content/60">
                      +{plan.features.length - 5} more features
                    </li>
                  )}
                </ul>

                {/* Actions */}
                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleEditClick(plan)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>

                {/* Subscribers count */}
                <div className="text-center text-sm text-base-content/60 mt-2 pt-2 border-t border-base-300">
                  {plan.subscriberCount || 0} active subscribers
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">
              {showEditModal ? "Edit Plan" : "Create New Plan"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (showEditModal) {
                  updateMutation.mutate({ planId: selectedPlan._id, data: formData });
                } else {
                  createMutation.mutate(formData);
                }
              }}
              className="space-y-4 mt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Plan Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.value === "true" })
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                ></textarea>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Monthly Price ($)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.price.monthly}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: { ...formData.price, monthly: parseFloat(e.target.value) || 0 },
                      })
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Yearly Price ($)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.price.yearly}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: { ...formData.price, yearly: parseFloat(e.target.value) || 0 },
                      })
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Users</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    value={formData.limits.maxUsers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        limits: { ...formData.limits, maxUsers: parseInt(e.target.value) || 0 },
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Students</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    value={formData.limits.maxStudents}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        limits: { ...formData.limits, maxStudents: parseInt(e.target.value) || 0 },
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Batches</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    value={formData.limits.maxBatches}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        limits: { ...formData.limits, maxBatches: parseInt(e.target.value) || 0 },
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Storage (GB)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    value={formData.limits.maxStorage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        limits: { ...formData.limits, maxStorage: parseInt(e.target.value) || 0 },
                      })
                    }
                    min="0"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Features</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={addFeature}
                  >
                    <FaPlus /> Add Feature
                  </button>
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered input-sm flex-1"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="Enter feature"
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => removeFeature(index)}
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular toggle */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  />
                  <span className="label-text">Mark as Popular</span>
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedPlan(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : showEditModal ? (
                    "Update Plan"
                  ) : (
                    "Create Plan"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            >
              close
            </button>
          </form>
        </dialog>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Plan</h3>
            <p className="py-4">
              Are you sure you want to delete <strong>{selectedPlan?.name}</strong>? This action cannot be undone.
            </p>
            {selectedPlan?.subscriberCount > 0 && (
              <div className="alert alert-warning">
                <span>This plan has {selectedPlan.subscriberCount} active subscribers!</span>
              </div>
            )}
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPlan(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={() => deleteMutation.mutate(selectedPlan._id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowDeleteModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default PlansList;
