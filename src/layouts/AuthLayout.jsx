import React from "react";
import { Outlet, Link } from "react-router";
import Logo from "../components/Logo";
import {
  FaGraduationCap,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";

const FEATURES = [
  {
    Icon: FaGraduationCap,
    title: "Student Management",
    desc: "Track and manage student records efficiently",
    color: "#f5923d",
  },
  {
    Icon: FaChartLine,
    title: "Performance Tracking",
    desc: "Monitor progress with detailed analytics",
    color: "#ff6b6b",
  },
  {
    Icon: FaUsers,
    title: "Batch Management",
    desc: "Organize classes and schedules seamlessly",
    color: "#f5923d",
  },
  {
    Icon: FaShieldAlt,
    title: "Secure & Reliable",
    desc: "Enterprise-grade security for your data",
    color: "#ff6b6b",
  },
];

const STATS = [
  { val: "500+", label: "Active Students" },
  { val: "50+",  label: "Batches" },
  { val: "95%",  label: "Success Rate" },
];

const AuthLayout = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 overflow-x-hidden relative"
      style={{ background: "#0a1220" }}
    >
      {/* ── Background decorative orbs ─────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-8%] w-[520px] h-[520px] rounded-full animate-float"
          style={{
            background: "radial-gradient(circle, rgba(245,146,61,0.13) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-8%] w-[600px] h-[600px] rounded-full animate-float-reverse"
          style={{
            background: "radial-gradient(circle, rgba(255,107,107,0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(245,146,61,0.04) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 hero-grid-pattern opacity-20" />
      </div>

      <div className="w-full max-w-6xl relative z-10 overflow-x-hidden">
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          {/* ── Left Side — Branding & Features ──────────────────── */}
          <div className="hidden lg:flex flex-col gap-8 p-8">

            {/* Logo + heading */}
            <div className="space-y-5">
              <Link to="/" className="inline-block">
                <Logo dark />
              </Link>
              <h1 className="text-4xl font-bold leading-tight" style={{ color: "#fff" }}>
                Welcome to
                <br />
                <span
                  className="animate-gradient"
                  style={{
                    background: "linear-gradient(135deg, #f5923d 0%, #ff6b6b 50%, #f5923d 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    backgroundSize: "200% auto",
                  }}
                >
                  Coaching Management
                </span>
              </h1>
              <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                Streamline your coaching institute operations with our
                comprehensive management system.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map(({ Icon, title, desc, color }) => (
                <div
                  key={title}
                  className="group p-4 rounded-xl transition-all duration-300 cursor-default"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245,146,61,0.06)";
                    e.currentTarget.style.borderColor = "rgba(245,146,61,0.28)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `${color}1a` }}
                  >
                    <Icon className="text-xl" style={{ color }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "#fff" }}>
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-2">
              {STATS.map(({ val, label }) => (
                <div key={label}>
                  <div className="text-3xl font-bold" style={{ color: "#f5923d" }}>{val}</div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.42)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Side — Auth Card ────────────────────────────── */}
          <div className="w-full max-w-full">
            <div
              className="rounded-2xl shadow-2xl overflow-hidden"
              style={{
                background: "rgba(13, 26, 45, 0.85)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <div className="p-6 sm:p-8">
                {/* Mobile logo */}
                <div className="lg:hidden mb-6 flex justify-center">
                  <Logo dark />
                </div>

                {/* Form content via Outlet */}
                <Outlet />
              </div>
            </div>

            {/* Copyright */}
            <div
              className="text-center mt-5 text-xs"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              © 2026 RootX Coaching Management System. All rights reserved.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
