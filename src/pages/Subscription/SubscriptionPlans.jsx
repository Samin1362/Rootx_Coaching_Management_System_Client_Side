import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaCheck,
  FaTimes,
  FaCrown,
  FaRocket,
  FaStar,
  FaBuilding,
  FaClock,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useOrganization } from "../../contexts/organization";
import { useNotification } from "../../contexts/NotificationContext";

const SubscriptionPlans = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { organization, subscription, refreshOrganization } = useOrganization();
  const notification = useNotification();
  const queryClient = useQueryClient();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly or yearly

  // Fetch pending subscription request
  const { data: pendingRequest, refetch: refetchPending } = useQuery({
    queryKey: ["pending-subscription-request", organization?._id],
    queryFn: async () => {
      const response = await axiosSecure.get("/subscriptions/requests/pending");
      return response.data.data;
    },
    enabled: !!organization?._id,
  });

  // Cancel request mutation
  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      return axiosSecure.delete(`/subscriptions/requests/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pending-subscription-request"]);
      notification.success("Subscription request cancelled successfully");
    },
    onError: (error) => {
      notification.error(error.response?.data?.message || "Failed to cancel request");
    },
  });

  const handleCancelRequest = () => {
    if (pendingRequest && window.confirm("Are you sure you want to cancel this subscription request?")) {
      cancelRequestMutation.mutate(pendingRequest._id);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setError(null);
      const response = await axiosSecure.get("/subscriptions/plans");
      setPlans(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to load subscription plans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (tier) => {
    switch (tier) {
      case "free":
        return <FaRocket className="text-4xl text-primary" />;
      case "basic":
        return <FaBuilding className="text-4xl text-info" />;
      case "professional":
        return <FaStar className="text-4xl text-warning" />;
      case "enterprise":
        return <FaCrown className="text-4xl text-success" />;
      default:
        return <FaRocket className="text-4xl text-primary" />;
    }
  };

  const getPlanColor = (tier) => {
    switch (tier) {
      case "free":
        return "border-primary";
      case "basic":
        return "border-info";
      case "professional":
        return "border-warning";
      case "enterprise":
        return "border-success";
      default:
        return "border-base-300";
    }
  };

  const formatPrice = (price) => {
    return "৳" + new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatLimit = (limit) => {
    if (limit === undefined || limit === null) return "0";
    return limit === -1 ? "Unlimited" : limit.toLocaleString();
  };

  const handleChoosePlan = async (plan) => {
    if (!organization) {
      navigate("/login");
      return;
    }

    // Check if there's already a pending request
    if (pendingRequest) {
      notification.warning("You already have a pending subscription request. Please wait for admin approval or cancel the existing request.");
      return;
    }

    try {
      setUpgrading(true);
      setError(null);

      const response = await axiosSecure.post("/subscriptions/upgrade", {
        planId: plan._id,
        billingCycle,
      });

      if (response.data.success) {
        // Show success notification for pending approval
        notification.success(
          response.data.message || `Your request to ${plan.name} plan has been submitted for approval.`
        );
        // Refresh the pending request
        await refetchPending();
        // Navigate back to subscription management
        navigate("/dashboard/subscription");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to submit plan request. Please try again.";
      setError(errorMessage);
      notification.error(errorMessage);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body items-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-16 w-16 text-error" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="card-title text-error">Error Loading Plans</h2>
            <p className="text-base-content/70">{error}</p>
            <div className="card-actions justify-center mt-4">
              <button onClick={fetchPlans} className="btn btn-primary">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back to Dashboard Link */}
        {organization && (
          <div className="mb-6">
            <Link to="/dashboard/subscription" className="btn btn-ghost btn-sm gap-2">
              <FaArrowLeft /> Back to Subscription
            </Link>
          </div>
        )}

        {/* Pending Request Banner */}
        {pendingRequest && (
          <div className="mb-8 alert alert-warning shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
              <div className="flex items-center gap-3 flex-1">
                <FaClock className="text-2xl flex-shrink-0" />
                <div>
                  <h3 className="font-bold">You have a pending subscription request</h3>
                  <p className="text-sm opacity-80">
                    Requested: <span className="font-semibold capitalize">{pendingRequest.requestedPlanName || pendingRequest.requestedTier}</span> plan
                    ({pendingRequest.requestedBillingCycle}) - Awaiting admin approval
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/dashboard/subscription" className="btn btn-ghost btn-sm">
                  View Details
                </Link>
                <button
                  onClick={handleCancelRequest}
                  disabled={cancelRequestMutation.isPending}
                  className="btn btn-outline btn-sm"
                >
                  {cancelRequestMutation.isPending ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <>
                      <FaTimes className="text-xs" /> Cancel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-base-content mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-base-content/60 mb-8">
            Select the perfect plan for your coaching center
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-base-100 p-2 rounded-full shadow-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-primary text-white shadow-lg"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                billingCycle === "yearly"
                  ? "bg-primary text-white shadow-lg"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-success text-white px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`group card bg-base-100/60 backdrop-blur-xl border border-base-content/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 ${
                plan.isPopular ? "ring-2 ring-primary ring-offset-4 ring-offset-base-200" : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="badge badge-primary badge-lg font-bold text-white shadow-lg animate-bounce">
                    ⭐ MOST POPULAR
                  </div>
                </div>
              )}

              <div className="card-body p-8 flex flex-col items-center text-center">
                {/* Icon Container */}
                <div className="w-20 h-20 rounded-2xl bg-base-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  {getPlanIcon(plan.tier)}
                </div>

                {/* Plan Name */}
                <h2 className="text-3xl font-black text-base-content tracking-tight mb-2">
                  {plan.name}
                </h2>

                {/* Description */}
                <p className="text-base-content/60 text-sm mb-6 min-h-[40px]">
                  {plan.description}
                </p>

                {/* Price Section */}
                <div className="mb-8 w-full py-4 rounded-xl bg-base-content/5">
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-black text-primary mb-1">
                      {formatPrice(billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice)}
                    </span>
                    <span className="text-sm font-medium text-base-content/50">
                      per {billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && plan.yearlyPrice > 0 && (
                    <div className="badge badge-success badge-sm text-white font-bold mt-2 py-3 px-4">
                      Save {formatPrice(plan.monthlyPrice * 12 - plan.yearlyPrice)}/year
                    </div>
                  )}
                </div>

                {/* Features Section */}
                <div className="w-full text-left space-y-4 mb-8">
                  <div className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-4 px-1 border-b border-base-content/5 pb-2">
                    Features & Limits
                  </div>
                  
                  {/* Students */}
                  <div className="flex items-start gap-3 group/feature">
                    <div className="mt-1 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-success text-[10px]" />
                    </div>
                    <span className="text-sm text-base-content/80">
                      <strong className="text-base-content">{formatLimit(plan.limits.maxStudents)}</strong> Students
                    </span>
                  </div>

                  {/* Batches */}
                  <div className="flex items-start gap-3 group/feature">
                    <div className="mt-1 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-success text-[10px]" />
                    </div>
                    <span className="text-sm text-base-content/80">
                      <strong className="text-base-content">{formatLimit(plan.limits.maxBatches)}</strong> Batches
                    </span>
                  </div>

                  {/* Staff */}
                  <div className="flex items-start gap-3 group/feature">
                    <div className="mt-1 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-success text-[10px]" />
                    </div>
                    <span className="text-sm text-base-content/80">
                      <strong className="text-base-content">{formatLimit(plan.limits.maxStaff || plan.limits.maxUsers)}</strong> Staff
                    </span>
                  </div>

                  {/* Storage */}
                  <div className="flex items-start gap-3 group/feature">
                    <div className="mt-1 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-success text-[10px]" />
                    </div>
                    <span className="text-sm text-base-content/80">
                      <strong className="text-base-content">{plan.limits.maxStorage} MB</strong> Storage
                    </span>
                  </div>

                  {/* Key Features List */}
                  {(plan.limits?.features || []).slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 group/feature animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FaCheck className="text-primary text-[10px]" />
                      </div>
                      <span className="text-sm text-base-content/80 capitalize">
                        {feature.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}

                  {/* More features indicator */}
                  {(plan.limits?.features || []).length > 5 && (
                    <div className="text-center">
                      <button className="text-xs font-bold text-primary/60 hover:text-primary transition-colors">
                        + {(plan.limits?.features || []).length - 5} more advanced features
                      </button>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="mt-auto w-full">
                  <button
                    onClick={() => handleChoosePlan(plan)}
                    disabled={
                      upgrading ||
                      !!pendingRequest ||
                      (organization && subscription?.planId === plan._id && subscription?.billingCycle === billingCycle)
                    }
                    className={`btn btn-lg w-full h-16 rounded-2xl border-none font-black text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-102 active:scale-95 ${
                      upgrading ? "loading" : ""
                    } ${
                      pendingRequest
                        ? "btn-disabled bg-base-300 text-base-content/50"
                        : plan.isPopular
                        ? "bg-gradient-to-r from-primary to-secondary text-white"
                        : plan.tier === "free"
                        ? "btn-outline border-2 border-primary text-primary hover:bg-primary"
                        : "bg-base-content text-base-100 hover:bg-base-content/90"
                    }`}
                    title={pendingRequest ? "You have a pending subscription request" : ""}
                  >
                    {upgrading
                      ? "Processing..."
                      : pendingRequest
                      ? "Request Pending"
                      : plan.tier === "free"
                      ? "Get Started Free"
                      : "Request Plan"}
                  </button>
                  
                  {/* Trial Info */}
                  {plan.trialDays > 0 && (
                    <div className="text-center mt-4">
                      <span className="text-xs font-bold text-base-content/40 bg-base-content/5 px-3 py-1 rounded-full">
                        {plan.trialDays}-day free trial included
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="collapse collapse-plus bg-base-100 shadow-lg">
              <input type="radio" name="faq-accordion" defaultChecked />
              <div className="collapse-title text-lg font-semibold">
                Can I change my plan later?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70">
                  Yes! You can upgrade or downgrade your plan at any time. Changes
                  will be reflected in your next billing cycle.
                </p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-100 shadow-lg">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-semibold">
                What happens when I reach my limits?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70">
                  You'll receive notifications when approaching your limits. You
                  can upgrade your plan to continue adding more students, batches,
                  or staff members.
                </p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-100 shadow-lg">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-semibold">
                Is there a free trial?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70">
                  Yes! Most paid plans include a 14-30 day free trial. No credit
                  card required to start.
                </p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-100 shadow-lg">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-semibold">
                What payment methods do you accept?
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70">
                  We accept credit/debit cards, mobile banking (bKash, Nagad), and
                  bank transfers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="card bg-gradient-to-r from-primary to-secondary text-white shadow-2xl max-w-2xl mx-auto">
            <div className="card-body">
              <h3 className="text-2xl font-bold mb-2">
                Need a Custom Plan?
              </h3>
              <p className="mb-4">
                Contact our sales team for enterprise solutions and custom pricing
              </p>
              <button className="btn btn-white bg-white text-primary hover:bg-base-100 shadow-lg">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
