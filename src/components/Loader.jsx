import React from "react";
import { FaGraduationCap } from "react-icons/fa";

/**
 * Loader Component
 *
 * A beautiful, animated loading indicator that matches the project theme
 *
 * Usage:
 * <Loader /> - Full screen loader
 * <Loader size="sm" /> - Small inline loader
 * <Loader message="Loading data..." /> - With custom message
 */

const Loader = ({ size = "md", message = "Loading...", fullScreen = true }) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-16 h-16",
      icon: "text-2xl",
      text: "text-sm",
      dots: "w-2 h-2",
    },
    md: {
      container: "w-24 h-24",
      icon: "text-4xl",
      text: "text-base",
      dots: "w-3 h-3",
    },
    lg: {
      container: "w-32 h-32",
      icon: "text-5xl",
      text: "text-lg",
      dots: "w-4 h-4",
    },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      className={`
        ${fullScreen ? "fixed inset-0 z-50" : "relative"}
        flex items-center justify-center
        bg-base-100/80 backdrop-blur-sm
      `}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo Container */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div
            className={`
              ${config.container}
              rounded-full
              border-4 border-primary/20
              border-t-primary
              animate-spin
            `}
          />

          {/* Inner pulsing icon */}
          <div
            className={`
              absolute inset-0
              flex items-center justify-center
              ${config.icon}
              text-primary
              animate-pulse
            `}
          >
            <FaGraduationCap />
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-3">
          <p
            className={`
              ${config.text}
              font-semibold
              text-base-content
              animate-pulse
            `}
          >
            {message}
          </p>

          {/* Animated Dots */}
          <div className="flex items-center gap-2">
            <div
              className={`
                ${config.dots}
                rounded-full
                bg-primary
                animate-bounce
              `}
              style={{ animationDelay: "0ms" }}
            />
            <div
              className={`
                ${config.dots}
                rounded-full
                bg-secondary
                animate-bounce
              `}
              style={{ animationDelay: "150ms" }}
            />
            <div
              className={`
                ${config.dots}
                rounded-full
                bg-accent
                animate-bounce
              `}
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>

        {/* Progress Bar (Optional) */}
        <div className="w-64 h-1 bg-base-300 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-primary via-secondary to-accent animate-progress-bar" />
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes progress-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-progress-bar {
          animation: progress-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
