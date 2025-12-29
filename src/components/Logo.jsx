import React from "react";

const Logo = () => {
  return (
    <div className="group relative flex items-center gap-3 cursor-pointer select-none py-2">
      {/* Animated Background Glow */}
      <div
        className="
          absolute inset-0 -z-10 rounded-2xl
          bg-linear-to-r from-primary/0 via-primary/5 to-secondary/5
          opacity-0 group-hover:opacity-100
          blur-2xl
          transition-all duration-500 ease-out
          group-hover:scale-110
        "
      ></div>

      {/* Logo Icon Container */}
      <div className="relative">
        {/* Rotating Ring Effect */}
        <div
          className="
            absolute inset-0 w-11 h-11 -m-0.5
            rounded-xl border-2 border-primary/30
            opacity-0 group-hover:opacity-100
            transition-all duration-500
            group-hover:rotate-180
          "
        ></div>

        {/* Secondary Rotating Ring */}
        <div
          className="
            absolute inset-0 w-11 h-11 -m-0.5
            rounded-xl border-2 border-secondary/30
            opacity-0 group-hover:opacity-100
            transition-all duration-700
            group-hover:-rotate-180
          "
        ></div>

        {/* Main Logo Box */}
        <div
          className="
            relative w-10 h-10 rounded-xl
            bg-linear-to-br from-primary via-primary to-secondary
            flex items-center justify-center
            shadow-md
            transition-all duration-500 ease-out
            group-hover:shadow-2xl
            group-hover:shadow-primary/30
            group-hover:scale-110
            group-hover:rotate-6
            overflow-hidden
          "
        >
          {/* Shimmer Effect */}
          <div
            className="
              absolute inset-0 -translate-x-full
              bg-linear-to-r from-transparent via-white/30 to-transparent
              group-hover:translate-x-full
              transition-transform duration-1000
              skew-x-12
            "
          ></div>

          {/* Letter R */}
          <span
            className="
              relative z-10
              text-white font-bold text-xl
              transition-all duration-300
              group-hover:scale-110
            "
          >
            R
          </span>
        </div>

        {/* Animated Accent Dots */}
        <span
          className="
            absolute -bottom-1 -right-1
            w-3 h-3 rounded-full bg-secondary
            shadow-lg shadow-secondary/50
            transition-all duration-300
            group-hover:scale-125
            animate-pulse
          "
        ></span>

        <span
          className="
            absolute -top-1 -left-1
            w-2 h-2 rounded-full bg-primary
            shadow-md shadow-primary/50
            opacity-0 group-hover:opacity-100
            transition-all duration-300
            group-hover:scale-125
          "
        ></span>
      </div>

      {/* Brand Text */}
      <div className="relative flex flex-col leading-tight">
        {/* Main Title with Gradient */}
        <h1 className="text-xl font-bold tracking-tight">
          <span
            className="
              bg-linear-to-r from-secondary via-primary to-primary
              bg-clip-text text-transparent
              transition-all duration-500
              group-hover:from-primary group-hover:via-secondary group-hover:to-primary
            "
          >
            Root
          </span>
          <span
            className="
              text-primary font-extrabold
              transition-all duration-300
              inline-block
              group-hover:scale-110
              group-hover:rotate-12
            "
          >
            X
          </span>
        </h1>

        {/* Subtitle */}
        <span
          className="
            text-[10px] text-base-content/60 font-medium
            tracking-wider uppercase
            transition-all duration-300
            group-hover:text-base-content/80
            group-hover:tracking-widest
          "
        >
          Coaching Management
        </span>

        {/* Animated Underline */}
        <span
          className="
            absolute -bottom-1 left-0
            h-0.5 w-0 rounded-full
            bg-linear-to-r from-primary via-secondary to-primary
            transition-all duration-500 ease-out
            group-hover:w-full
            shadow-sm shadow-primary/50
          "
        ></span>

        {/* Second Underline Layer */}
        <span
          className="
            absolute -bottom-1.5 left-0
            h-0.5 w-0 rounded-full
            bg-linear-to-r from-secondary/50 to-primary/50
            blur-sm
            transition-all duration-700 ease-out
            group-hover:w-full
          "
        ></span>
      </div>

      {/* Floating Particles Effect */}
      <div
        className="
          absolute top-0 right-0 w-1 h-1
          bg-primary rounded-full
          opacity-0 group-hover:opacity-100
          transition-all duration-1000
          group-hover:-translate-y-2 group-hover:translate-x-2
        "
      ></div>
      <div
        className="
          absolute bottom-0 left-0 w-1 h-1
          bg-secondary rounded-full
          opacity-0 group-hover:opacity-100
          transition-all duration-1000
          group-hover:translate-y-2 group-hover:-translate-x-2
        "
      ></div>
    </div>
  );
};

export default Logo;
