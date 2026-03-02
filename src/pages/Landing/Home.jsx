import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  FaGraduationCap,
  FaLayerGroup,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaClipboardList,
  FaUserPlus,
  FaChartBar,
  FaShieldAlt,
  FaArrowRight,
  FaCheck,
  FaQuoteLeft,
  FaStar,
  FaRocket,
  FaTrophy,
  FaPlay,
  FaUsers,
  FaBuilding,
  FaBolt,
  FaChevronDown,
} from "react-icons/fa";
import { MdSettings } from "react-icons/md";

/* ────────────────────────────────────────────────
   Custom hook — animated count-up
──────────────────────────────────────────────── */
function useCountUp(end, shouldStart = false, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, shouldStart, duration]);
  return count;
}

/* ────────────────────────────────────────────────
   Scroll Reveal hook
──────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    const elements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right"
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ────────────────────────────────────────────────
   Dashboard Mockup — CSS-drawn preview
──────────────────────────────────────────────── */
const DashboardMockup = () => {
  const bars = [55, 72, 48, 88, 65, 78, 95, 60, 83, 70];
  return (
    <div className="relative animate-float-slow">
      {/* Outer glow */}
      <div
        className="absolute -inset-4 rounded-2xl blur-2xl opacity-30"
        style={{ background: "linear-gradient(135deg, #f5923d, #ff6b6b)" }}
      />

      {/* Window frame */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "#0d1a2d",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          width: "100%",
          maxWidth: "520px",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{
            background: "#060d1a",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <div
            className="flex-1 mx-3 h-6 rounded-md flex items-center justify-center text-xs"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            rootx.app/dashboard/overview
          </div>
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px]"
            style={{ background: "rgba(245,146,61,0.2)", color: "#f5923d" }}
          >
            R
          </div>
        </div>

        {/* App layout */}
        <div className="flex" style={{ height: "320px" }}>
          {/* Sidebar */}
          <div
            className="flex flex-col gap-1 p-3 flex-shrink-0"
            style={{
              width: "130px",
              background: "#060d1a",
              borderRight: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="text-[9px] uppercase tracking-widest px-2 pt-1 pb-2 font-semibold"
              style={{ color: "rgba(245,146,61,0.7)" }}
            >
              Menu
            </div>
            {[
              { label: "Dashboard", active: true },
              { label: "Students", active: false },
              { label: "Batches", active: false },
              { label: "Attendance", active: false },
              { label: "Fees", active: false },
              { label: "Exams", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-medium"
                style={{
                  background: item.active ? "rgba(245,146,61,0.15)" : "transparent",
                  color: item.active
                    ? "#f5923d"
                    : "rgba(255,255,255,0.4)",
                  borderLeft: item.active
                    ? "2px solid #f5923d"
                    : "2px solid transparent",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: item.active
                      ? "#f5923d"
                      : "rgba(255,255,255,0.2)",
                  }}
                />
                {item.label}
              </div>
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 p-3 overflow-hidden" style={{ background: "#0d1a2d" }}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                Overview
              </span>
              <span
                className="text-[9px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
              >
                ● Live
              </span>
            </div>

            {/* Stat cards 2×2 */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Students", value: "1,234", delta: "+12%", color: "#f5923d" },
                { label: "Revenue", value: "₹2.4L", delta: "+8%", color: "#ff6b6b" },
                { label: "Batches", value: "24", delta: "Active", color: "#38bdf8" },
                { label: "Pass Rate", value: "96%", delta: "↑3%", color: "#22c55e" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg p-2"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="text-[9px] mb-0.5"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {stat.label}
                  </div>
                  <div
                    className="text-sm font-bold leading-none"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {stat.delta}
                  </div>
                </div>
              ))}
            </div>

            {/* Mini bar chart */}
            <div
              className="rounded-lg p-2 mb-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                className="text-[9px] mb-2"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Monthly Fee Collection
              </div>
              <div className="flex items-end gap-1" style={{ height: "40px" }}>
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all duration-500"
                    style={{
                      height: `${h}%`,
                      background:
                        i === bars.length - 1
                          ? "linear-gradient(to top, #f5923d, #ff6b6b)"
                          : "rgba(245,146,61,0.35)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Recent students */}
            <div className="flex flex-col gap-1">
              {[
                { name: "Rahul Kumar", batch: "Batch A", status: "paid" },
                { name: "Priya Sharma", batch: "Batch B", status: "due" },
                { name: "Amit Patel", batch: "Batch A", status: "paid" },
              ].map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between px-2 py-1 rounded-md"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #f5923d, #ff6b6b)" }}
                    >
                      {s.name[0]}
                    </div>
                    <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {s.batch}
                    </span>
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background:
                          s.status === "paid"
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(251,191,36,0.15)",
                        color: s.status === "paid" ? "#22c55e" : "#fbbf24",
                      }}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────
   Features data
──────────────────────────────────────────────── */
const features = [
  {
    icon: FaGraduationCap,
    title: "Student Management",
    description:
      "Manage student profiles, batch assignments, roll numbers, parent linking, and full academic history in one place.",
    color: "#f5923d",
  },
  {
    icon: FaLayerGroup,
    title: "Batch & Class Management",
    description:
      "Create and manage batches with capacity limits, custom schedules, and real-time enrollment tracking.",
    color: "#ff6b6b",
  },
  {
    icon: FaCalendarCheck,
    title: "Attendance Tracking",
    description:
      "Mark live attendance, generate daily & monthly reports, and track per-student summaries with percentage stats.",
    color: "#38bdf8",
  },
  {
    icon: FaMoneyBillWave,
    title: "Fee & Finance Management",
    description:
      "Handle fee collection, track dues, manage expenses, generate receipts, and process teacher salaries.",
    color: "#22c55e",
  },
  {
    icon: FaClipboardList,
    title: "Exam & Assessment",
    description:
      "Schedule exams, manage grade submissions through a 6-state approval workflow, and generate report cards.",
    color: "#a78bfa",
  },
  {
    icon: FaUserPlus,
    title: "Admission Management",
    description:
      "Streamline the entire inquiry-to-enrollment pipeline with follow-up reminders and admission status tracking.",
    color: "#f59e0b",
  },
  {
    icon: FaChartBar,
    title: "Analytics & Reports",
    description:
      "Comprehensive attendance, academic, financial, and teacher workload reports — all exportable as CSV.",
    color: "#ec4899",
  },
  {
    icon: FaShieldAlt,
    title: "Role-Based Access Control",
    description:
      "7 permission levels from org owner to student. Granular access control with full multi-tenant isolation.",
    color: "#14b8a6",
  },
];

/* ────────────────────────────────────────────────
   Pricing plans
──────────────────────────────────────────────── */
const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect for small coaching centers just getting started.",
    highlight: false,
    badge: null,
    features: [
      "Up to 50 students",
      "5 batches",
      "Basic attendance",
      "Fee tracking",
      "Email support",
    ],
    cta: "Get Started",
    ctaLink: "/signup",
  },
  {
    name: "Professional",
    price: "₹1,499",
    period: "/month",
    description: "Everything you need to run a growing coaching institute.",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Up to 500 students",
      "Unlimited batches",
      "Advanced analytics",
      "Exam management",
      "Priority support",
      "Custom branding",
      "CSV export",
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large institutes requiring full customization and scale.",
    highlight: false,
    badge: null,
    features: [
      "Unlimited students",
      "Unlimited batches",
      "All features",
      "Dedicated support",
      "API access",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    ctaLink: "/#contact",
  },
];

/* ────────────────────────────────────────────────
   Testimonials
──────────────────────────────────────────────── */
const testimonials = [
  {
    quote:
      "RootX CMS transformed how we manage our 400+ students. The batch management and automated fee collection alone saved us countless hours every month.",
    name: "Rahul Sharma",
    role: "Director",
    org: "Apex Learning Institute",
    initials: "RS",
    color: "#f5923d",
    stars: 5,
  },
  {
    quote:
      "The live attendance feature is outstanding. Real-time reports make parent communication effortless. We saved over 3 hours daily just on attendance alone.",
    name: "Priya Mehta",
    role: "Principal",
    org: "BrightFuture Academy",
    initials: "PM",
    color: "#ff6b6b",
    stars: 5,
  },
  {
    quote:
      "The exam analytics helped us identify weak areas in our teaching. Our batch pass rate improved from 78% to 96% within a single academic semester.",
    name: "Ankit Verma",
    role: "Founder",
    org: "Target IIT Coaching",
    initials: "AV",
    color: "#38bdf8",
    stars: 5,
  },
];

/* ────────────────────────────────────────────────
   Stats Section with animated counters
──────────────────────────────────────────────── */
const statsData = [
  { end: 500, suffix: "+", label: "Coaching Centers", icon: FaBuilding, color: "#f5923d" },
  { end: 50000, suffix: "+", label: "Students Managed", icon: FaUsers, color: "#ff6b6b" },
  { end: 98, suffix: "%", label: "Client Satisfaction", icon: FaTrophy, color: "#22c55e" },
  { end: 99, suffix: ".9%", label: "Platform Uptime", icon: FaBolt, color: "#38bdf8" },
];

const StatsSection = () => {
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const counts = [
    useCountUp(500, started, 1800),
    useCountUp(50000, started, 2200),
    useCountUp(98, started, 1600),
    useCountUp(99, started, 1400),
  ];

  return (
    <section
      ref={ref}
      className="relative py-20 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d1a2d 0%, #111827 100%)" }}
    >
      {/* Subtle diagonal stripe */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #f5923d 0px, #f5923d 1px, transparent 1px, transparent 40px)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center group">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${stat.color}15`,
                    border: `1px solid ${stat.color}30`,
                  }}
                >
                  <Icon style={{ color: stat.color, fontSize: "1.4rem" }} />
                </div>
                <div
                  className="text-4xl sm:text-5xl font-extrabold mb-2 tabular-nums"
                  style={{ color: stat.color }}
                >
                  {stat.end === 50000
                    ? counts[i].toLocaleString()
                    : counts[i]}
                  {stat.suffix}
                </div>
                <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ────────────────────────────────────────────────
   MAIN HOME COMPONENT
──────────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();

  useScrollReveal();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ color: "rgba(255,255,255,0.85)" }}>
      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden hero-grid-pattern"
        style={{ paddingTop: "5rem" }}
      >
        {/* Floating orbs */}
        <div
          className="absolute top-20 left-[-5%] w-80 h-80 rounded-full blur-3xl opacity-20 animate-float pointer-events-none"
          style={{ background: "radial-gradient(circle, #f5923d, transparent)" }}
        />
        <div
          className="absolute bottom-10 right-[-5%] w-96 h-96 rounded-full blur-3xl opacity-15 animate-float-reverse pointer-events-none"
          style={{ background: "radial-gradient(circle, #ff6b6b, transparent)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f5923d, #ff6b6b, transparent)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div className="text-center lg:text-left">
              {/* Badge chip */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 animate-fadeIn"
                style={{
                  background: "rgba(245,146,61,0.1)",
                  border: "1px solid rgba(245,146,61,0.3)",
                  color: "#f5923d",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "#f5923d" }}
                />
                Multi-tenant SaaS • Now with Firebase Auth
              </div>

              {/* Headline */}
              <h1 className="font-extrabold leading-tight mb-6">
                <span
                  className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl"
                  style={{ color: "rgba(255,255,255,0.95)" }}
                >
                  Transform Your
                </span>
                <span
                  className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl animate-gradient"
                  style={{
                    background: "linear-gradient(270deg, #f5923d, #ff6b6b, #fbbf24, #f5923d)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Coaching Institute
                </span>
                <span
                  className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl"
                  style={{ color: "rgba(255,255,255,0.95)" }}
                >
                  Management
                </span>
              </h1>

              {/* Sub-headline */}
              <p
                className="text-base sm:text-lg lg:text-xl mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                The all-in-one SaaS platform built for coaching centers. Manage
                students, batches, fees, attendance, exams, and reports — all in one
                powerful dashboard.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Link
                  to="/signup"
                  className="btn-shine inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #f5923d 0%, #ff6b6b 100%)",
                    color: "#fff",
                    boxShadow: "0 6px 24px rgba(245,146,61,0.45)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 10px 36px rgba(245,146,61,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 6px 24px rgba(245,146,61,0.45)";
                  }}
                >
                  <FaRocket className="text-sm" />
                  Get Started Free
                </Link>

                <button
                  onClick={() => scrollTo("features")}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold transition-all duration-300"
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245,146,61,0.1)";
                    e.currentTarget.style.borderColor = "rgba(245,146,61,0.4)";
                    e.currentTarget.style.color = "#f5923d";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                  }}
                >
                  See Features
                  <FaChevronDown className="text-sm" />
                </button>
              </div>

              {/* Micro-stats row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start">
                {[
                  { value: "500+", label: "Institutes" },
                  { value: "50K+", label: "Students" },
                  { value: "99.9%", label: "Uptime" },
                  { value: "96%", label: "Avg Pass Rate" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#f5923d" }}
                    />
                    <span className="font-semibold text-sm" style={{ color: "#f5923d" }}>
                      {s.value}
                    </span>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Dashboard Mockup */}
            <div className="flex justify-center lg:justify-end">
              <DashboardMockup />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Scroll to explore
          </span>
          <FaChevronDown className="text-xs animate-bounce" style={{ color: "rgba(255,255,255,0.4)" }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — TRUST BANNER (Marquee)
      ══════════════════════════════════════════ */}
      <section
        className="py-5 overflow-hidden relative"
        style={{
          background: "rgba(245,146,61,0.06)",
          borderTop: "1px solid rgba(245,146,61,0.12)",
          borderBottom: "1px solid rgba(245,146,61,0.12)",
        }}
      >
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, rep) => (
            <div key={rep} className="flex items-center gap-0 flex-shrink-0">
              {[
                "500+ Coaching Centers",
                "50,000+ Students Managed",
                "₹10 Crore+ Revenue Processed",
                "99.9% Platform Uptime",
                "Multi-tenant SaaS Architecture",
                "Firebase Auth Security",
                "Real-time Attendance Tracking",
                "Automated Fee Receipts",
                "CSV Export & Reports",
                "Role-Based Access Control",
              ].map((item, i) => (
                <div key={`${rep}-${i}`} className="flex items-center gap-6 mx-6 sm:mx-8">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {item}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#f5923d", opacity: 0.6 }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — FEATURES GRID
      ══════════════════════════════════════════ */}
      <section
        id="features"
        className="py-24 relative overflow-hidden"
        style={{ background: "#0d1a2d" }}
      >
        {/* Subtle background orb */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #ff6b6b, transparent)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16 reveal">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                background: "rgba(245,146,61,0.1)",
                color: "#f5923d",
                border: "1px solid rgba(245,146,61,0.2)",
              }}
            >
              Powerful Features
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              Everything You Need to Run Your
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Coaching Center
              </span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              From student enrollment to exam results — every module you need,
              seamlessly integrated in one platform.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              const delayClass = `reveal-delay-${Math.min((i % 4) * 100 + 100, 400)}`;
              return (
                <div
                  key={feature.title}
                  className={`reveal ${delayClass} group relative rounded-2xl p-6 cursor-default transition-all duration-400`}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${feature.color}08`;
                    e.currentTarget.style.borderColor = `${feature.color}35`;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 12px 40px ${feature.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Icon */}
                  <div className="relative mb-5 w-fit">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `${feature.color}18`,
                        border: `1px solid ${feature.color}30`,
                      }}
                    >
                      <Icon style={{ color: feature.color, fontSize: "1.25rem" }} />
                    </div>
                    {/* Pulse ring on hover */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 animate-pulse-ring"
                      style={{ border: `1px solid ${feature.color}40` }}
                    />
                  </div>

                  <h3
                    className="text-base font-bold mb-2"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "#0a1220" }}
      >
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(245,146,61,0.5) 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                background: "rgba(245,146,61,0.1)",
                color: "#f5923d",
                border: "1px solid rgba(245,146,61,0.2)",
              }}
            >
              Simple Setup
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              Up and Running in
              <span
                style={{
                  background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginLeft: "0.5rem",
                }}
              >
                Minutes
              </span>
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              No lengthy setup, no IT team required. Three simple steps to
              transform your coaching center management.
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connecting line (desktop only) */}
            <div
              className="hidden md:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)]"
              style={{
                height: "2px",
                background: "linear-gradient(to right, #f5923d40, #ff6b6b40)",
                borderTop: "2px dashed rgba(245,146,61,0.25)",
                top: "3.5rem",
              }}
            />

            {[
              {
                step: "01",
                icon: FaRocket,
                title: "Sign Up",
                description:
                  "Create your organization account, choose a subscription plan, and invite your team members with the right roles.",
                color: "#f5923d",
                delay: "reveal-delay-100",
              },
              {
                step: "02",
                icon: MdSettings,
                title: "Configure",
                description:
                  "Set up your batches, add teachers and students, configure fee structures and exam schedules — all in minutes.",
                color: "#ff6b6b",
                delay: "reveal-delay-300",
              },
              {
                step: "03",
                icon: FaTrophy,
                title: "Manage & Grow",
                description:
                  "Run your coaching center with real-time dashboards, automated reports, and powerful analytics to drive growth.",
                color: "#22c55e",
                delay: "reveal-delay-500",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className={`reveal ${step.delay} text-center relative z-10`}>
                  {/* Step number + icon */}
                  <div className="flex flex-col items-center mb-6">
                    <div
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}25, ${step.color}10)`,
                        border: `2px solid ${step.color}40`,
                      }}
                    >
                      <Icon style={{ color: step.color, fontSize: "1.6rem" }} />
                      {/* Step badge */}
                      <span
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center"
                        style={{
                          background: step.color,
                          color: "#0f172a",
                        }}
                      >
                        {step.step.slice(1)}
                      </span>
                    </div>
                  </div>

                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: "rgba(255,255,255,0.95)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed max-w-xs mx-auto"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA under steps */}
          <div className="text-center mt-14 reveal">
            <Link
              to="/signup"
              className="btn-shine inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f5923d 0%, #ff6b6b 100%)",
                color: "#fff",
                boxShadow: "0 6px 24px rgba(245,146,61,0.35)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 10px 36px rgba(245,146,61,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(245,146,61,0.35)";
              }}
            >
              Start Your Free Account
              <FaArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — ANIMATED STATS
      ══════════════════════════════════════════ */}
      <StatsSection />

      {/* ══════════════════════════════════════════
          SECTION 6 — PRICING PREVIEW
      ══════════════════════════════════════════ */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "#0d1a2d" }}
      >
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f5923d, transparent)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                background: "rgba(245,146,61,0.1)",
                color: "#f5923d",
                border: "1px solid rgba(245,146,61,0.2)",
              }}
            >
              Flexible Pricing
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              Plans for Every
              <span
                style={{
                  background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginLeft: "0.5rem",
                }}
              >
                Coaching Center
              </span>
            </h2>
            <p className="text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`reveal reveal-delay-${(i + 1) * 200} relative rounded-2xl p-7 flex flex-col transition-all duration-300 ${
                  plan.highlight ? "gradient-border" : ""
                }`}
                style={{
                  background: plan.highlight ? "#132030" : "rgba(255,255,255,0.03)",
                  border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.08)",
                  transform: plan.highlight ? "scale(1.03)" : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (!plan.highlight) {
                    e.currentTarget.style.borderColor = "rgba(245,146,61,0.3)";
                    e.currentTarget.style.background = "rgba(245,146,61,0.05)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  } else {
                    e.currentTarget.style.transform = "scale(1.03) translateY(-4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.highlight) {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.transform = "translateY(0)";
                  } else {
                    e.currentTarget.style.transform = "scale(1.03) translateY(0)";
                  }
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                    style={{
                      background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                      color: "#fff",
                    }}
                  >
                    ★ {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span
                      className="text-4xl font-extrabold"
                      style={{
                        color: plan.highlight ? "#f5923d" : "rgba(255,255,255,0.9)",
                      }}
                    >
                      {plan.price}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {plan.description}
                  </p>
                </div>

                {/* Feature list */}
                <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <FaCheck
                        className="flex-shrink-0 text-xs"
                        style={{ color: plan.highlight ? "#f5923d" : "#22c55e" }}
                      />
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to={plan.ctaLink}
                  className="block text-center py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={
                    plan.highlight
                      ? {
                          background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                          color: "#fff",
                          boxShadow: "0 4px 16px rgba(245,146,61,0.4)",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.8)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!plan.highlight) {
                      e.currentTarget.style.background = "rgba(245,146,61,0.12)";
                      e.currentTarget.style.borderColor = "rgba(245,146,61,0.4)";
                      e.currentTarget.style.color = "#f5923d";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.highlight) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                    }
                  }}
                >
                  {plan.cta} →
                </Link>
              </div>
            ))}
          </div>

          {/* View all plans link */}
          <div className="text-center mt-10 reveal">
            <Link
              to="/plans"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f5923d")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              View full pricing details & feature comparison
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7 — TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "#0a1220" }}
      >
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #f5923d, transparent)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                background: "rgba(245,146,61,0.1)",
                color: "#f5923d",
                border: "1px solid rgba(245,146,61,0.2)",
              }}
            >
              Testimonials
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              Trusted by Coaching Centers
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #f5923d, #ff6b6b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Across India
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`reveal reveal-delay-${(i + 1) * 200} group rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300`}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${t.color}08`;
                  e.currentTarget.style.borderColor = `${t.color}30`;
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(t.stars)].map((_, j) => (
                    <FaStar key={j} style={{ color: "#fbbf24", fontSize: "0.85rem" }} />
                  ))}
                </div>

                {/* Quote icon */}
                <FaQuoteLeft style={{ color: t.color, fontSize: "1.5rem", opacity: 0.6 }} />

                {/* Quote text */}
                <p
                  className="text-sm sm:text-base leading-relaxed flex-1"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  "{t.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`,
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {t.name}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {t.role} • {t.org}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8 — CTA BANNER
      ══════════════════════════════════════════ */}
      <section
        id="contact"
        className="relative py-24 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #c1631a 0%, #f5923d 35%, #ff6b6b 65%, #c94040 100%)",
        }}
      >
        {/* Floating decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full blur-2xl opacity-20 animate-float pointer-events-none"
          style={{ background: "rgba(255,255,255,0.3)" }} />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full blur-2xl opacity-15 animate-float-reverse pointer-events-none"
          style={{ background: "rgba(255,255,255,0.3)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "rgba(255,255,255,0.4)" }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-tight">
              Ready to Transform Your
              <br />
              Coaching Center?
            </h2>
            <p
              className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Join 500+ coaching institutes already using RootX CMS. Start free
              today — no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn-shine inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-300"
                style={{
                  background: "#fff",
                  color: "#c1631a",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.2)";
                }}
              >
                <FaRocket />
                Get Started Free
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "2px solid rgba(255,255,255,0.4)",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Already have an account? Login →
              </Link>
            </div>

            {/* Trust indicators */}
            <div
              className="flex flex-wrap justify-center gap-6 mt-12 pt-8"
              style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
            >
              {[
                "✓ Free plan forever",
                "✓ No credit card required",
                "✓ 5-minute setup",
                "✓ 99.9% uptime SLA",
              ].map((item) => (
                <span
                  key={item}
                  className="text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
