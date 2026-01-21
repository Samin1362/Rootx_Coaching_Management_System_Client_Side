import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaCrown,
  FaRocket,
  FaStar,
  FaBuilding,
} from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const SubscriptionPlans = () => {
  const axiosSecure = useAxiosSecure();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly or yearly

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axiosSecure.get("/subscriptions/plans");
      setPlans(response.data.data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
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
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatLimit = (limit) => {
    return limit === -1 ? "Unlimited" : limit.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-7xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`card bg-base-100 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-2 ${getPlanColor(
                plan.tier
              )} ${plan.isPopular ? "ring-4 ring-warning ring-offset-4" : ""}`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="badge badge-warning badge-lg font-bold text-white shadow-lg">
                    ⭐ MOST POPULAR
                  </div>
                </div>
              )}

              <div className="card-body p-6">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.tier)}
                </div>

                {/* Plan Name */}
                <h2 className="card-title text-2xl font-bold text-center justify-center mb-2">
                  {plan.name}
                </h2>

                {/* Description */}
                <p className="text-center text-base-content/60 text-sm mb-4">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary">
                    {billingCycle === "monthly"
                      ? formatPrice(plan.monthlyPrice)
                      : formatPrice(plan.yearlyPrice)}
                  </div>
                  <div className="text-sm text-base-content/60">
                    per {billingCycle === "monthly" ? "month" : "year"}
                  </div>
                  {billingCycle === "yearly" && plan.yearlyPrice > 0 && (
                    <div className="text-xs text-success font-semibold mt-1">
                      Save{" "}
                      {formatPrice(
                        plan.monthlyPrice * 12 - plan.yearlyPrice
                      )}
                      /year
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {/* Students */}
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-success flex-shrink-0" />
                    <span className="text-sm">
                      <strong>{formatLimit(plan.limits.maxStudents)}</strong>{" "}
                      Students
                    </span>
                  </div>

                  {/* Batches */}
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-success flex-shrink-0" />
                    <span className="text-sm">
                      <strong>{formatLimit(plan.limits.maxBatches)}</strong>{" "}
                      Batches
                    </span>
                  </div>

                  {/* Staff */}
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-success flex-shrink-0" />
                    <span className="text-sm">
                      <strong>{formatLimit(plan.limits.maxStaff)}</strong> Staff
                      Members
                    </span>
                  </div>

                  {/* Storage */}
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-success flex-shrink-0" />
                    <span className="text-sm">
                      <strong>{plan.limits.maxStorage} MB</strong> Storage
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="divider my-2"></div>

                  {/* Key Features */}
                  {plan.limits.features.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FaCheck className="text-success flex-shrink-0" />
                      <span className="text-sm capitalize">
                        {feature.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}

                  {/* More features indicator */}
                  {plan.limits.features.length > 5 && (
                    <div className="text-xs text-primary font-semibold text-center">
                      + {plan.limits.features.length - 5} more features
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className={`btn w-full ${
                    plan.isPopular
                      ? "btn-warning text-white"
                      : plan.tier === "free"
                      ? "btn-outline btn-primary"
                      : "btn-primary text-white"
                  } shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
                >
                  {plan.tier === "free" ? "Get Started Free" : "Choose Plan"}
                </button>

                {/* Trial Info */}
                {plan.trialDays > 0 && (
                  <div className="text-center text-xs text-base-content/60 mt-2">
                    {plan.trialDays}-day free trial included
                  </div>
                )}
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
