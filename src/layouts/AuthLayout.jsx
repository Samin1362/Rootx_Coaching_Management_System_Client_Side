import React from "react";
import { Outlet, Link } from "react-router";
import Logo from "../components/Logo";
import {
  FaGraduationCap,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-3 sm:p-4 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10 overflow-x-hidden">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Features */}
          <div className="hidden lg:flex flex-col gap-8 p-8">
            {/* Logo Section */}
            <div className="space-y-4">
              <Link to="/" className="inline-block">
                <Logo />
              </Link>
              <h1 className="text-4xl font-bold text-base-content leading-tight">
                Welcome to
                <br />
                <span className="bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Coaching Management
                </span>
              </h1>
              <p className="text-base-content/70 text-lg">
                Streamline your coaching institute operations with our
                comprehensive management system.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Feature 1 */}
              <div className="group p-4 rounded-xl bg-base-100/50 backdrop-blur-sm border border-base-300 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <FaGraduationCap className="text-2xl text-primary" />
                </div>
                <h3 className="font-semibold text-base-content mb-1">
                  Student Management
                </h3>
                <p className="text-sm text-base-content/60">
                  Track and manage student records efficiently
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-4 rounded-xl bg-base-100/50 backdrop-blur-sm border border-base-300 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <FaChartLine className="text-2xl text-secondary" />
                </div>
                <h3 className="font-semibold text-base-content mb-1">
                  Performance Tracking
                </h3>
                <p className="text-sm text-base-content/60">
                  Monitor progress with detailed analytics
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-4 rounded-xl bg-base-100/50 backdrop-blur-sm border border-base-300 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="text-2xl text-primary" />
                </div>
                <h3 className="font-semibold text-base-content mb-1">
                  Batch Management
                </h3>
                <p className="text-sm text-base-content/60">
                  Organize classes and schedules seamlessly
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-4 rounded-xl bg-base-100/50 backdrop-blur-sm border border-base-300 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <FaShieldAlt className="text-2xl text-secondary" />
                </div>
                <h3 className="font-semibold text-base-content mb-1">
                  Secure & Reliable
                </h3>
                <p className="text-sm text-base-content/60">
                  Enterprise-grade security for your data
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-base-content/60">
                  Active Students
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">50+</div>
                <div className="text-sm text-base-content/60">Batches</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-base-content/60">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-full">
            <div className="card bg-base-100 shadow-2xl border border-base-300 overflow-hidden">
              <div className="card-body p-4 sm:p-6 lg:p-8">
                {/* Mobile Logo */}
                <div className="lg:hidden mb-4 sm:mb-6 flex justify-center">
                  <Logo />
                </div>

                {/* Auth Form Content (Login/Register) */}
                <Outlet />
              </div>
            </div>

            {/* Footer Links */}
            <div className="text-center mt-6 text-sm text-base-content/60">
              <p>
                © 2026 RootX Coaching Management System.
                <br className="sm:hidden" /> All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
