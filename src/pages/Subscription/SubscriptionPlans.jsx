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
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
  FaBolt,
  FaShieldAlt,
  FaHeadset,
} from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useOrganization } from "../../contexts/organization";
import { useNotification } from "../../contexts/NotificationContext";

/* ─────────────────────────────────────────────
   Colour palette per tier (matches brand theme)
───────────────────────────────────────────── */
const TIER_COLORS = {
  free: { accent: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)" },
  basic: { accent: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)" },
  professional: { accent: "#f5923d", bg: "rgba(245,146,61,0.10)", border: "rgba(245,146,61,0.35)" },
  enterprise: { accent: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)" },
};

const getTierStyle = (tier) =>
  TIER_COLORS[tier] || { accent: "#f5923d", bg: "rgba(245,146,61,0.08)", border: "rgba(245,146,61,0.2)" };

/* FAQ data */
const faqs = [
  {
    q: "Can I change my plan later?",
    a: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle after admin approval.",
  },
  {
    q: "What happens when I reach my limits?",
    a: "You'll receive notifications when approaching your limits. Upgrade your plan to continue adding more students, batches, or staff members.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Most paid plans include a 14–30 day free trial. No credit card required to start your trial.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept credit/debit cards, mobile banking (bKash, Nagad), and direct bank transfers.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use Firebase Authentication, encrypted connections, and multi-tenant data isolation so your organization's data is always private and protected.",
  },
];

/* Simple FAQ accordion item */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: open ? "rgba(245,146,61,0.06)" : "rgba(255,255,255,0.03)",
        border: open ? "1px solid rgba(245,146,61,0.25)" : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
          {q}
        </span>
        {open ? (
          <FaChevronUp className="flex-shrink-0 text-sm" style={{ color: "#f5923d" }} />
        ) : (
          <FaChevronDown className="flex-shrink-0 text-sm" style={{ color: "rgba(255,255,255,0.4)" }} />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {a}
          </p>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
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
  const [billingCycle, setBillingCycle] = useState("monthly");

  /* Fetch pending subscription request */
  const { data: pendingRequest, refetch: refetchPending } = useQuery({
    queryKey: ["pending-subscription-request", organization?._id],
    queryFn: async () => {
      const response = await axiosSecure.get("/subscriptions/requests/pending");
      return response.data.data;
    },
    enabled: !!organization?._id,
  });

  /* Cancel request mutation */
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
    if (
      pendingRequest &&
      window.confirm("Are you sure you want to cancel this subscription request?")
    ) {
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
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load subscription plans. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (tier) => {
    const style = getTierStyle(tier);
    const iconProps = { style: { color: style.accent, fontSize: "1.75rem" } };
    switch (tier) {
      case "free":        return <FaRocket {...iconProps} />;
      case "basic":       return <FaBuilding {...iconProps} />;
      case "professional":return <FaStar {...iconProps} />;
      case "enterprise":  return <FaCrown {...iconProps} />;
      default:            return <FaRocket {...iconProps} />;
    }
  };

  const formatPrice = (price) =>
    "৳" +
    new Intl.NumberFormat("en-BD", { minimumFractionDigits: 0 }).format(price);

  const formatLimit = (limit) => {
    if (limit === undefined || limit === null) return "0";
    return limit === -1 ? "Unlimited" : limit.toLocaleString();
  };

  const handleChoosePlan = async (plan) => {
    if (!organization) {
      navigate("/login");
      return;
    }
    if (pendingRequest) {
      notification.warning(
        "You already have a pending subscription request. Please wait for admin approval or cancel the existing request."
      );
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
        notification.success(
          response.data.message ||
            `Your request to ${plan.name} plan has been submitted for approval.`
        );
        await refetchPending();
        navigate("/dashboard/subscription");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to submit plan request. Please try again.";
      setError(errorMessage);
      notification.error(errorMessage);
    } finally {
      setUpgrading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0f172a" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: "linear-gradient(135deg, #f5923d, #ff6b6b)" }}
          >
            <FaRocket className="text-white text-xl" />
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Loading plans…
          </p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "#0f172a" }}
      >
        <div
          className="max-w-md w-full rounded-2xl p-8 text-center"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(239,68,68,0.15)" }}
          >
            <FaTimes style={{ color: "#ef4444", fontSize: "1.5rem" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "rgba(255,255,255,0.9)" }}>
            Error Loading Plans
          </h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
            {error}
          </p>
          <button
            onClick={fetchPlans}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
              color: "#fff",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div style={{ background: "#0f172a", color: "rgba(255,255,255,0.85)" }}>

      {/* ═══════════════════════════════════════════
          HERO / HEADER
      ═══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          paddingTop: "7rem",
          paddingBottom: "4rem",
          background: "linear-gradient(180deg, #060d1a 0%, #0d1a2d 100%)",
        }}
      >
        {/* Background orbs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f5923d, transparent)" }}
        />
        <div
          className="absolute top-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-8 pointer-events-none"
          style={{ background: "radial-gradient(circle, #ff6b6b, transparent)" }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(245,146,61,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.4,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link — only when logged in */}
          {organization && (
            <div className="mb-8">
              <Link
                to="/dashboard/subscription"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f5923d")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                <FaArrowLeft className="text-xs" />
                Back to Subscription
              </Link>
            </div>
          )}

          {/* Page heading */}
          <div className="text-center max-w-3xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
              style={{
                background: "rgba(245,146,61,0.1)",
                color: "#f5923d",
                border: "1px solid rgba(245,146,61,0.2)",
              }}
            >
              Flexible Pricing
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
              Choose Your{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Plan
              </span>
            </h1>

            <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>
              Start free, scale as you grow. All plans include our core features.
              No hidden fees.
            </p>

            {/* Billing cycle toggle */}
            <div
              className="inline-flex items-center p-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {["monthly", "yearly"].map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className="relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                  style={
                    billingCycle === cycle
                      ? {
                          background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                          color: "#fff",
                          boxShadow: "0 4px 14px rgba(245,146,61,0.4)",
                        }
                      : { color: "rgba(255,255,255,0.5)" }
                  }
                >
                  {cycle === "monthly" ? "Monthly" : "Yearly"}
                  {cycle === "yearly" && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={
                        billingCycle === "yearly"
                          ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                          : { background: "rgba(34,197,94,0.2)", color: "#22c55e" }
                      }
                    >
                      −17%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PENDING REQUEST BANNER
      ═══════════════════════════════════════════ */}
      {pendingRequest && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div
            className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 rounded-2xl"
            style={{
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.3)",
            }}
          >
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(251,191,36,0.15)" }}
              >
                <FaClock style={{ color: "#fbbf24", fontSize: "1rem" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                  Pending subscription request
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Requested:{" "}
                  <span className="font-semibold capitalize" style={{ color: "#fbbf24" }}>
                    {pendingRequest.requestedPlanName || pendingRequest.requestedTier}
                  </span>{" "}
                  ({pendingRequest.requestedBillingCycle}) — awaiting admin approval
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/dashboard/subscription"
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                View Details
              </Link>
              <button
                onClick={handleCancelRequest}
                disabled={cancelRequestMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#f87171",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                {cancelRequestMutation.isPending ? (
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaTimes className="text-[10px]" />
                )}
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          PLANS GRID
      ═══════════════════════════════════════════ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {plans.map((plan) => {
              const ts = getTierStyle(plan.tier);
              const isCurrentPlan =
                organization &&
                subscription?.planId === plan._id &&
                subscription?.billingCycle === billingCycle;
              const isPopular = plan.isPopular;
              const displayPrice =
                billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

              return (
                <div
                  key={plan._id}
                  className="relative flex flex-col rounded-2xl transition-all duration-400 group"
                  style={{
                    background: isPopular
                      ? "rgba(245,146,61,0.06)"
                      : "rgba(255,255,255,0.03)",
                    border: isPopular
                      ? "2px solid rgba(245,146,61,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isPopular
                      ? "0 0 40px rgba(245,146,61,0.12), inset 0 0 40px rgba(245,146,61,0.04)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isPopular) {
                      e.currentTarget.style.borderColor = ts.border;
                      e.currentTarget.style.background = ts.bg;
                      e.currentTarget.style.transform = "translateY(-4px)";
                    } else {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 16px 50px rgba(245,146,61,0.2), inset 0 0 40px rgba(245,146,61,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPopular) {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.transform = "translateY(0)";
                    } else {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 0 40px rgba(245,146,61,0.12), inset 0 0 40px rgba(245,146,61,0.04)";
                    }
                  }}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span
                        className="px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                        style={{
                          background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                          color: "#fff",
                          boxShadow: "0 4px 12px rgba(245,146,61,0.4)",
                        }}
                      >
                        ★ Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-6">
                    {/* Icon + plan name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: ts.bg, border: `1px solid ${ts.border}` }}
                      >
                        {getPlanIcon(plan.tier)}
                      </div>
                      <div>
                        <h2
                          className="text-lg font-extrabold leading-none mb-0.5"
                          style={{ color: "rgba(255,255,255,0.95)" }}
                        >
                          {plan.name}
                        </h2>
                        <span
                          className="text-[10px] uppercase font-bold tracking-widest"
                          style={{ color: ts.accent, opacity: 0.8 }}
                        >
                          {plan.tier}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed mb-5"
                      style={{ color: "rgba(255,255,255,0.45)", minHeight: "36px" }}
                    >
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div
                      className="rounded-xl p-4 mb-5 text-center"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="flex items-baseline justify-center gap-1">
                        <span
                          className="text-4xl font-black tabular-nums"
                          style={{ color: ts.accent }}
                        >
                          {formatPrice(displayPrice)}
                        </span>
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </div>
                      {billingCycle === "yearly" && plan.yearlyPrice > 0 && (
                        <span
                          className="inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(34,197,94,0.15)",
                            color: "#22c55e",
                          }}
                        >
                          Save {formatPrice(plan.monthlyPrice * 12 - plan.yearlyPrice)}/yr
                        </span>
                      )}
                    </div>

                    {/* Limits */}
                    <div
                      className="space-y-2.5 mb-5 pb-5"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p
                        className="text-[10px] uppercase tracking-widest font-bold mb-3"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        Limits
                      </p>
                      {[
                        { label: "Students", value: formatLimit(plan.limits?.maxStudents) },
                        { label: "Batches", value: formatLimit(plan.limits?.maxBatches) },
                        {
                          label: "Staff",
                          value: formatLimit(plan.limits?.maxStaff || plan.limits?.maxUsers),
                        },
                        { label: "Storage", value: `${plan.limits?.maxStorage || 0} MB` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                            {label}
                          </span>
                          <span
                            className="text-xs font-bold"
                            style={{ color: "rgba(255,255,255,0.8)" }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    <div className="space-y-2.5 mb-6 flex-1">
                      <p
                        className="text-[10px] uppercase tracking-widest font-bold mb-3"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        Features
                      </p>
                      {(plan.limits?.features || []).slice(0, 5).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <div
                            className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `${ts.accent}20` }}
                          >
                            <FaCheck
                              style={{ color: ts.accent, fontSize: "0.45rem" }}
                            />
                          </div>
                          <span
                            className="text-xs capitalize leading-snug"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                          >
                            {feature.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                      {(plan.limits?.features || []).length > 5 && (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          +{(plan.limits?.features || []).length - 5} more features
                        </p>
                      )}
                    </div>

                    {/* CTA button */}
                    <div className="mt-auto">
                      <button
                        onClick={() => handleChoosePlan(plan)}
                        disabled={upgrading || !!pendingRequest || isCurrentPlan}
                        className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-250"
                        style={
                          isCurrentPlan
                            ? {
                                background: "rgba(34,197,94,0.12)",
                                color: "#22c55e",
                                border: "1px solid rgba(34,197,94,0.3)",
                                cursor: "default",
                              }
                            : pendingRequest
                            ? {
                                background: "rgba(255,255,255,0.05)",
                                color: "rgba(255,255,255,0.3)",
                                cursor: "not-allowed",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }
                            : isPopular
                            ? {
                                background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                                color: "#fff",
                                boxShadow: "0 4px 16px rgba(245,146,61,0.4)",
                                border: "none",
                              }
                            : {
                                background: ts.bg,
                                color: ts.accent,
                                border: `1px solid ${ts.border}`,
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!upgrading && !pendingRequest && !isCurrentPlan) {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            if (isPopular) {
                              e.currentTarget.style.boxShadow =
                                "0 8px 24px rgba(245,146,61,0.55)";
                            }
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          if (isPopular && !upgrading) {
                            e.currentTarget.style.boxShadow =
                              "0 4px 16px rgba(245,146,61,0.4)";
                          }
                        }}
                      >
                        {upgrading
                          ? "Processing…"
                          : isCurrentPlan
                          ? "✓ Current Plan"
                          : pendingRequest
                          ? "Request Pending"
                          : plan.tier === "free"
                          ? "Get Started Free"
                          : "Request Plan"}
                      </button>

                      {/* Trial info */}
                      {plan.trialDays > 0 && (
                        <p
                          className="text-center text-[11px] mt-3"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          Includes {plan.trialDays}-day free trial
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-12">
            {[
              { icon: FaShieldAlt, text: "Firebase Auth + Encrypted data" },
              { icon: FaBolt, text: "99.9% uptime SLA" },
              { icon: FaHeadset, text: "Priority support on paid plans" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-sm"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                <Icon style={{ color: "#f5923d", fontSize: "0.85rem" }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMPARE — feature comparison strip
      ═══════════════════════════════════════════ */}
      <section
        className="py-16"
        style={{
          background: "linear-gradient(180deg, #0a1220 0%, #0d1a2d 100%)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-center mb-10"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            What's included in every plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { icon: FaCheck, color: "#22c55e", title: "Student management", desc: "Profiles, roll numbers, parent linking, batch assignments" },
              { icon: FaCheck, color: "#22c55e", title: "Attendance tracking", desc: "Live marking, reports, student-wise summaries" },
              { icon: FaCheck, color: "#22c55e", title: "Fee management", desc: "Collection, dues tracking, receipts, expense records" },
              { icon: FaCheck, color: "#22c55e", title: "Batch & class management", desc: "Schedules, capacity limits, enrollment tracking" },
              { icon: FaCheck, color: "#22c55e", title: "Exam & results", desc: "Scheduling, grade submissions, report cards" },
              { icon: FaCheck, color: "#22c55e", title: "Role-based access control", desc: "7 permission levels, multi-tenant data isolation" },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 px-5 py-4 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${color}15` }}
                >
                  <Icon style={{ color, fontSize: "0.7rem" }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════ */}
      <section
        className="py-16"
        style={{ background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              className="text-2xl sm:text-3xl font-extrabold"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Frequently Asked{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Questions
              </span>
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CONTACT / CUSTOM PLAN CTA
      ═══════════════════════════════════════════ */}
      <section
        className="py-16"
        style={{ background: "#0a1220", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative rounded-2xl overflow-hidden px-8 sm:px-12 py-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, #c1631a 0%, #f5923d 35%, #ff6b6b 65%, #c94040 100%)",
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute top-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: "rgba(255,255,255,0.4)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ background: "rgba(255,255,255,0.4)" }}
            />
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />

            <div className="relative">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Need a Custom Plan?
              </h3>
              <p
                className="text-base sm:text-lg mb-8 max-w-xl mx-auto"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                Our sales team will work with you on a tailored solution for your
                institute's specific needs and scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  className="btn-shine px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: "#fff",
                    color: "#c1631a",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                  }}
                >
                  Contact Sales
                </button>
                <Link
                  to="/login"
                  className="px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  }}
                >
                  Login to Your Account →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPlans;
