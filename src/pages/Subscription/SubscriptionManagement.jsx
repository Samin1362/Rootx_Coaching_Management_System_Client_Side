import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FaCrown,
  FaCalendar,
  FaCreditCard,
  FaArrowUp,
  FaCheck,
  FaExclamationTriangle,
  FaHistory,
  FaDownload,
} from "react-icons/fa";
import { useOrganization } from "../../contexts/organization";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const SubscriptionManagement = () => {
  const { organization, subscription, loading: orgLoading, error: orgError, refreshOrganization } = useOrganization();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [organization?._id]);

  const fetchPayments = async () => {
    if (!organization?._id) return;
    try {
      setPaymentsLoading(true);
      const response = await axiosSecure.get("/subscriptions/payments");
      setPayments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: "badge-success",
      trial: "badge-info",
      past_due: "badge-warning",
      cancelled: "badge-error",
      suspended: "badge-error",
    };
    return badges[status] || "badge-ghost";
  };

  // const getTierColor = (tier) => {
  //   const colors = {
  //     free: "text-primary",
  //     basic: "text-info",
  //     professional: "text-warning",
  //     enterprise: "text-success",
  //   };
  //   return colors[tier] || "text-base-content";
  // };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateUsagePercentage = (current, max) => {
    if (max === -1) return 0; // Unlimited
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return "progress-error";
    if (percentage >= 75) return "progress-warning";
    return "progress-success";
  };

  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (orgError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-16 w-16 text-error" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="card-title text-error">Error Loading Organization</h2>
            <p className="text-base-content/70">{orgError}</p>
            <div className="card-actions justify-center mt-4">
              <button onClick={refreshOrganization} className="btn btn-primary">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-base-content/60">No organization found</p>
          <p className="text-sm text-base-content/40 mt-2">Please contact support</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
            <FaCrown className="text-primary" />
            Subscription Management
          </h1>
          <p className="text-base-content/60 mt-1">
            Manage your subscription and billing
          </p>
        </div>
      </div>

      {/* Current Plan Card */}
      <div className="card bg-gradient-to-br from-primary to-secondary text-white shadow-2xl">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className={`text-3xl font-bold capitalize`}>
                  {subscription?.tier || "Free"} Plan
                </h2>
                <div className={`badge ${getStatusBadge(subscription?.status)} badge-lg`}>
                  {subscription?.status || "Active"}
                </div>
              </div>
              <p className="text-white/80 mb-4">
                {organization?.name || "Your Organization"}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FaCalendar />
                  <span>
                    Renews on {subscription?.nextBillingDate ? formatDate(subscription.nextBillingDate) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCreditCard />
                  <span>
                    {formatCurrency(subscription?.amount || 0)}/{subscription?.billingCycle || "month"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/plans")}
                className="btn btn-white bg-white text-primary hover:bg-base-100"
              >
                <FaArrowUp />
                Upgrade Plan
              </button>
              <button className="btn btn-outline btn-white border-white text-white hover:bg-white/10">
                <FaHistory />
                Billing History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Students Usage */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg">Students</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-primary">
                {organization?.usage?.currentStudents || 0}
              </span>
              <span className="text-base-content/60">
                / {organization?.limits?.maxStudents === -1 ? "∞" : organization?.limits?.maxStudents || 0}
              </span>
            </div>
            <progress
              className={`progress ${getUsageColor(
                calculateUsagePercentage(
                  organization?.usage?.currentStudents || 0,
                  organization?.limits?.maxStudents || 0
                )
              )} w-full`}
              value={organization?.usage?.currentStudents || 0}
              max={organization?.limits?.maxStudents === -1 ? 100 : organization?.limits?.maxStudents || 100}
            ></progress>
            <p className="text-sm text-base-content/60 mt-2">
              {calculateUsagePercentage(
                organization?.usage?.currentStudents || 0,
                organization?.limits?.maxStudents || 0
              ).toFixed(0)}% used
            </p>
          </div>
        </div>

        {/* Batches Usage */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg">Batches</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-info">
                {organization?.usage?.currentBatches || 0}
              </span>
              <span className="text-base-content/60">
                / {organization?.limits?.maxBatches === -1 ? "∞" : organization?.limits?.maxBatches || 0}
              </span>
            </div>
            <progress
              className={`progress ${getUsageColor(
                calculateUsagePercentage(
                  organization?.usage?.currentBatches || 0,
                  organization?.limits?.maxBatches || 0
                )
              )} w-full`}
              value={organization?.usage?.currentBatches || 0}
              max={organization?.limits?.maxBatches === -1 ? 100 : organization?.limits?.maxBatches || 100}
            ></progress>
            <p className="text-sm text-base-content/60 mt-2">
              {calculateUsagePercentage(
                organization?.usage?.currentBatches || 0,
                organization?.limits?.maxBatches || 0
              ).toFixed(0)}% used
            </p>
          </div>
        </div>

        {/* Staff Usage */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg">Staff Members</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-success">
                {organization?.usage?.currentStaff || 0}
              </span>
              <span className="text-base-content/60">
                / {organization?.limits?.maxStaff === -1 ? "∞" : organization?.limits?.maxStaff || 0}
              </span>
            </div>
            <progress
              className={`progress ${getUsageColor(
                calculateUsagePercentage(
                  organization?.usage?.currentStaff || 0,
                  organization?.limits?.maxStaff || 0
                )
              )} w-full`}
              value={organization?.usage?.currentStaff || 0}
              max={organization?.limits?.maxStaff === -1 ? 100 : organization?.limits?.maxStaff || 100}
            ></progress>
            <p className="text-sm text-base-content/60 mt-2">
              {calculateUsagePercentage(
                organization?.usage?.currentStaff || 0,
                organization?.limits?.maxStaff || 0
              ).toFixed(0)}% used
            </p>
          </div>
        </div>
      </div>

      {/* Features & Limits */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">Plan Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organization?.limits?.features?.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <FaCheck className="text-success flex-shrink-0" />
                <span className="capitalize">{feature.replace(/_/g, " ")}</span>
              </div>
            )) || (
              <p className="text-base-content/60">No features available</p>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Prompt (if approaching limits) */}
      {organization?.limits?.maxStudents !== -1 &&
        calculateUsagePercentage(
          organization?.usage?.currentStudents,
          organization?.limits?.maxStudents
        ) >= 80 && (
          <div className="alert alert-warning shadow-lg">
            <FaExclamationTriangle className="text-2xl" />
            <div>
              <h3 className="font-bold">Approaching Student Limit</h3>
              <div className="text-sm">
                You're using {organization?.usage?.currentStudents} of{" "}
                {organization?.limits?.maxStudents} students. Consider upgrading
                to add more students.
              </div>
            </div>
            <button onClick={() => navigate("/plans")} className="btn btn-sm btn-primary">Upgrade Now</button>
          </div>
        )}

      {/* Billing History */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">Recent Invoices</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paymentsLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <span className="loading loading-spinner text-primary"></span>
                    </td>
                  </tr>
                ) : payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment._id}>
                      <td>{payment.invoiceNumber}</td>
                      <td>{formatDate(payment.date)}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>
                        <div className={`badge badge-${payment.status === "paid" ? "success" : "warning"} capitalize`}>
                          {payment.status}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" title="Download Invoice">
                          <FaDownload />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-base-content/40">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
