import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import {
  FaCreditCard,
  FaArrowLeft,
  FaBuilding,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBan,
  FaDollarSign,
  FaHistory,
  FaEdit,
  FaPlus,
} from "react-icons/fa";

const SubscriptionDetails = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // Fetch subscription details
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ["super-admin-subscription", subscriptionId],
    queryFn: async () => {
      const response = await axiosSecure.get(`/super-admin/subscriptions/${subscriptionId}`);
      return response.data.data;
    },
  });

  // Fetch payment history
  const { data: paymentsData } = useQuery({
    queryKey: ["super-admin-subscription-payments", subscriptionId],
    queryFn: async () => {
      const response = await axiosSecure.get(`/super-admin/subscriptions/${subscriptionId}/payments`);
      return response.data.data;
    },
  });

  // Fetch available plans
  const { data: plans } = useQuery({
    queryKey: ["super-admin-plans"],
    queryFn: async () => {
      const response = await axiosSecure.get("/super-admin/plans");
      return response.data.data;
    },
  });

  // Extend subscription mutation
  const extendMutation = useMutation({
    mutationFn: async (days) => {
      return axiosSecure.put(`/super-admin/subscriptions/${subscriptionId}/extend`, { days });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-subscription", subscriptionId]);
      setShowExtendModal(false);
    },
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async (reason) => {
      return axiosSecure.put(`/super-admin/subscriptions/${subscriptionId}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-subscription", subscriptionId]);
      setShowCancelModal(false);
    },
  });

  // Reactivate subscription mutation
  const reactivateMutation = useMutation({
    mutationFn: async () => {
      return axiosSecure.put(`/super-admin/subscriptions/${subscriptionId}/reactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-subscription", subscriptionId]);
    },
  });

  // Change plan mutation
  const changePlanMutation = useMutation({
    mutationFn: async (planId) => {
      return axiosSecure.put(`/super-admin/subscriptions/${subscriptionId}/change-plan`, { planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-subscription", subscriptionId]);
      setShowChangePlanModal(false);
    },
  });

  // Add manual payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      return axiosSecure.post(`/super-admin/subscriptions/${subscriptionId}/payments`, paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["super-admin-subscription", subscriptionId]);
      queryClient.invalidateQueries(["super-admin-subscription-payments", subscriptionId]);
      setShowAddPaymentModal(false);
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="badge badge-success gap-1">
            <FaCheckCircle /> Active
          </span>
        );
      case "trial":
        return (
          <span className="badge badge-warning gap-1">
            <FaClock /> Trial
          </span>
        );
      case "expired":
        return (
          <span className="badge badge-error gap-1">
            <FaExclamationTriangle /> Expired
          </span>
        );
      case "cancelled":
        return (
          <span className="badge badge-ghost gap-1">
            <FaBan /> Cancelled
          </span>
        );
      default:
        return <span className="badge badge-ghost">{status}</span>;
    }
  };

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: "Expired", class: "text-error" };
    if (days <= 7) return { text: `${days} days`, class: "text-error" };
    if (days <= 30) return { text: `${days} days`, class: "text-warning" };
    return { text: `${days} days`, class: "text-success" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading subscription: {error.message}</span>
      </div>
    );
  }

  const daysRemaining = subscription?.endDate ? getDaysRemaining(subscription.endDate) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <FaCreditCard className="text-primary" />
              Subscription Details
            </h1>
            <p className="text-base-content/60 mt-1">
              {subscription?.organizationName || "Unknown Organization"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowChangePlanModal(true)}
          >
            <FaEdit className="mr-1" /> Change Plan
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={() => setShowExtendModal(true)}
          >
            <FaCalendarAlt className="mr-1" /> Extend
          </button>
          {subscription?.status === "cancelled" || subscription?.status === "expired" ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => reactivateMutation.mutate()}
              disabled={reactivateMutation.isPending}
            >
              <FaCheckCircle className="mr-1" /> Reactivate
            </button>
          ) : (
            <button
              className="btn btn-warning btn-sm"
              onClick={() => setShowCancelModal(true)}
            >
              <FaBan className="mr-1" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title">Subscription Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaBuilding className="text-primary text-xl" />
                    <div>
                      <p className="text-xs text-base-content/60">Organization</p>
                      <Link
                        to={`/super-admin/organizations/${subscription?.organizationId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {subscription?.organizationName || "View Organization"}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCreditCard className="text-primary text-xl" />
                    <div>
                      <p className="text-xs text-base-content/60">Plan</p>
                      <p className="font-medium">{subscription?.planName || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaClock className="text-primary text-xl" />
                    <div>
                      <p className="text-xs text-base-content/60">Status</p>
                      {getStatusBadge(subscription?.status)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-primary text-xl" />
                    <div>
                      <p className="text-xs text-base-content/60">Start Date</p>
                      <p className="font-medium">
                        {subscription?.startDate
                          ? new Date(subscription.startDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-primary text-xl" />
                    <div>
                      <p className="text-xs text-base-content/60">End Date</p>
                      <p className="font-medium">
                        {subscription?.endDate
                          ? new Date(subscription.endDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaClock className="text-primary text-xl" />
                    <div>
                      <p className="text-xs text-base-content/60">Time Remaining</p>
                      <p className={`font-bold ${daysRemaining?.class}`}>
                        {daysRemaining?.text || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title">
                  <FaHistory className="text-primary" /> Payment History
                </h2>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAddPaymentModal(true)}
                >
                  <FaPlus className="mr-1" /> Add Payment
                </button>
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsData?.payments?.length > 0 ? (
                      paymentsData.payments.map((payment) => (
                        <tr key={payment._id} className="hover">
                          <td>{new Date(payment.date).toLocaleDateString()}</td>
                          <td className="font-medium">${payment.amount?.toFixed(2)}</td>
                          <td className="capitalize">{payment.method || "N/A"}</td>
                          <td>
                            <span
                              className={`badge badge-sm ${
                                payment.status === "completed"
                                  ? "badge-success"
                                  : payment.status === "pending"
                                  ? "badge-warning"
                                  : "badge-error"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="text-xs font-mono">{payment.reference || "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-base-content/60">
                          No payment history
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Billing Summary */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">
                <FaDollarSign className="text-primary" /> Billing Summary
              </h2>
              <div className="stats stats-vertical w-full mt-4">
                <div className="stat px-0">
                  <div className="stat-title">Current Plan Price</div>
                  <div className="stat-value text-2xl">
                    ${subscription?.amount?.toFixed(2) || "0.00"}
                  </div>
                  <div className="stat-desc">per {subscription?.billingCycle || "month"}</div>
                </div>
                <div className="stat px-0">
                  <div className="stat-title">Total Paid</div>
                  <div className="stat-value text-2xl text-success">
                    ${paymentsData?.totalPaid?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div className="stat px-0">
                  <div className="stat-title">Outstanding</div>
                  <div className="stat-value text-2xl text-error">
                    ${paymentsData?.outstanding?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Limits */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">Plan Limits</h2>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between">
                  <span>Max Users</span>
                  <span className="font-medium">{subscription?.limits?.maxUsers || "Unlimited"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Students</span>
                  <span className="font-medium">{subscription?.limits?.maxStudents || "Unlimited"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Batches</span>
                  <span className="font-medium">{subscription?.limits?.maxBatches || "Unlimited"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage</span>
                  <span className="font-medium">{subscription?.limits?.maxStorage || 1} GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Usage */}
          <div className="card bg-base-100 shadow border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-lg">Current Usage</h2>
              <div className="space-y-3 mt-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Users</span>
                    <span>
                      {subscription?.usage?.users || 0} / {subscription?.limits?.maxUsers || "∞"}
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={subscription?.usage?.users || 0}
                    max={subscription?.limits?.maxUsers || 100}
                  ></progress>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Students</span>
                    <span>
                      {subscription?.usage?.students || 0} / {subscription?.limits?.maxStudents || "∞"}
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={subscription?.usage?.students || 0}
                    max={subscription?.limits?.maxStudents || 100}
                  ></progress>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Batches</span>
                    <span>
                      {subscription?.usage?.batches || 0} / {subscription?.limits?.maxBatches || "∞"}
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={subscription?.usage?.batches || 0}
                    max={subscription?.limits?.maxBatches || 100}
                  ></progress>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extend Modal */}
      {showExtendModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Extend Subscription</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                extendMutation.mutate(parseInt(e.target.days.value));
              }}
            >
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Days to extend</span>
                </label>
                <input
                  type="number"
                  name="days"
                  className="input input-bordered"
                  min="1"
                  max="365"
                  defaultValue="30"
                  required
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowExtendModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={extendMutation.isPending}>
                  {extendMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Extend"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowExtendModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-warning">Cancel Subscription</h3>
            <p className="py-4">Are you sure you want to cancel this subscription?</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                cancelMutation.mutate(e.target.reason.value);
              }}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason</span>
                </label>
                <textarea
                  name="reason"
                  className="textarea textarea-bordered"
                  placeholder="Enter reason..."
                  required
                ></textarea>
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowCancelModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-warning" disabled={cancelMutation.isPending}>
                  {cancelMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Cancel Subscription"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowCancelModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Change Plan Modal */}
      {showChangePlanModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Change Subscription Plan</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                changePlanMutation.mutate(e.target.planId.value);
              }}
            >
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Select New Plan</span>
                </label>
                <select
                  name="planId"
                  className="select select-bordered"
                  defaultValue={subscription?.planId}
                  required
                >
                  {plans?.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} - ${plan.price?.monthly}/month
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowChangePlanModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={changePlanMutation.isPending}
                >
                  {changePlanMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Change Plan"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowChangePlanModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Manual Payment</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                addPaymentMutation.mutate({
                  amount: parseFloat(formData.get("amount")),
                  method: formData.get("method"),
                  reference: formData.get("reference"),
                  notes: formData.get("notes"),
                });
              }}
            >
              <div className="space-y-4 mt-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Amount ($)</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    className="input input-bordered"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Payment Method</span>
                  </label>
                  <select name="method" className="select select-bordered" required>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Reference Number</span>
                  </label>
                  <input
                    type="text"
                    name="reference"
                    className="input input-bordered"
                    placeholder="Transaction ID, Check #, etc."
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Notes</span>
                  </label>
                  <textarea
                    name="notes"
                    className="textarea textarea-bordered"
                    placeholder="Additional notes..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowAddPaymentModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addPaymentMutation.isPending}
                >
                  {addPaymentMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Add Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowAddPaymentModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default SubscriptionDetails;
