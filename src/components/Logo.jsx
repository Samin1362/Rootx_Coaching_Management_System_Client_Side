import React from "react";

const Logo = () => {
  return (
    <div className="group flex items-center gap-3 cursor-pointer select-none">

      {/* Logo Mark */}
      <div className="relative">
        <div
          className="
            w-10 h-10 rounded-xl bg-primary
            flex items-center justify-center
            shadow-sm
            transition-all duration-300 ease-out
            group-hover:shadow-lg
            group-hover:-translate-y-0.5
          "
        >
          <span
            className="
              text-white font-semibold text-lg
              transition-transform duration-300
              group-hover:scale-105
            "
          >
            R
          </span>
        </div>

        {/* Accent Indicator */}
        <span
          className="
            absolute -bottom-1 -right-1
            w-2.5 h-2.5 rounded-full bg-secondary
            transition-transform duration-300
            group-hover:scale-125
          "
        ></span>
      </div>

      {/* Brand Text */}
      <div className="relative flex flex-col leading-tight">
        <h1 className="text-xl font-semibold text-neutral">
          Root<span className="text-primary">X</span>
        </h1>

        <span className="text-[11px] text-black tracking-wide">
          Coaching Management System
        </span>

        {/* Underline Reveal */}
        <span
          className="
            absolute -bottom-1 left-0
            h-0.5 w-0 bg-primary rounded-full
            transition-all duration-300 ease-out
            group-hover:w-full
          "
        ></span>
      </div>

      {/* Soft Hover Glow */}
      <div
        className="
          absolute inset-0 -z-10
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          blur-xl
          bg-primary/10 rounded-xl
        "
      ></div>
    </div>
  );
};

export default Logo;
