import React, { useEffect, useState, useCallback } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaTimes,
} from "react-icons/fa";

/**
 * Notification Component
 *
 * Usage:
 * <Notification
 *   type="success" | "error" | "warning" | "info"
 *   message="Your message here"
 *   title="Optional Title"
 *   duration={3000}
 *   onClose={() => {}}
 * />
 */

const Notification = ({
  type = "info",
  message = "",
  title = "",
  duration = 5000,
  onClose,
  position = "top-right",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  if (!isVisible) return null;

  // Configuration for different notification types
  const notificationConfig = {
    success: {
      icon: FaCheckCircle,
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-900/20",
      borderLight: "border-green-500",
      borderDark: "dark:border-green-500",
      iconColor: "text-green-600 dark:text-green-400",
      titleColor: "text-green-900 dark:text-green-100",
      messageColor: "text-green-800 dark:text-green-200",
      progressBar: "bg-green-500",
    },
    error: {
      icon: FaTimesCircle,
      bgLight: "bg-red-50",
      bgDark: "dark:bg-red-900/20",
      borderLight: "border-red-500",
      borderDark: "dark:border-red-500",
      iconColor: "text-red-600 dark:text-red-400",
      titleColor: "text-red-900 dark:text-red-100",
      messageColor: "text-red-800 dark:text-red-200",
      progressBar: "bg-red-500",
    },
    warning: {
      icon: FaExclamationCircle,
      bgLight: "bg-yellow-50",
      bgDark: "dark:bg-yellow-900/20",
      borderLight: "border-yellow-500",
      borderDark: "dark:border-yellow-500",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      titleColor: "text-yellow-900 dark:text-yellow-100",
      messageColor: "text-yellow-800 dark:text-yellow-200",
      progressBar: "bg-yellow-500",
    },
    info: {
      icon: FaInfoCircle,
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-900/20",
      borderLight: "border-blue-500",
      borderDark: "dark:border-blue-500",
      iconColor: "text-blue-600 dark:text-blue-400",
      titleColor: "text-blue-900 dark:text-blue-100",
      messageColor: "text-blue-800 dark:text-blue-200",
      progressBar: "bg-blue-500",
    },
  };

  const config = notificationConfig[type] || notificationConfig.info;
  const Icon = config.icon;

  // Position classes
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  // Animation classes
  const animationClass = isExiting
    ? "animate-slideOut opacity-0"
    : "animate-slideIn";

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 ${animationClass}`}
      style={{ minWidth: "320px", maxWidth: "420px" }}
    >
      <div
        className={`
          ${config.bgLight} ${config.bgDark}
          border-l-4 ${config.borderLight} ${config.borderDark}
          rounded-lg shadow-2xl
          overflow-hidden
          backdrop-blur-sm
          transform transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-3xl
        `}
      >
        {/* Main Content */}
        <div className="p-4 flex items-start gap-3">
          {/* Icon */}
          <div className={`shrink-0 ${config.iconColor} text-2xl mt-0.5`}>
            <Icon />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4
                className={`font-bold text-sm mb-1 ${config.titleColor} leading-tight`}
              >
                {title}
              </h4>
            )}
            <p
              className={`text-sm ${config.messageColor} leading-relaxed wrap-break-word`}
            >
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`
              shrink-0 ${config.iconColor}
              hover:opacity-70 transition-opacity
              focus:outline-none focus:ring-2 focus:ring-offset-2
              rounded-full p-1
            `}
            aria-label="Close notification"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Progress Bar */}
        {duration && duration > 0 && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full ${config.progressBar} animate-progress`}
              style={{
                animation: `progress ${duration}ms linear`,
              }}
            />
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-slideOut {
          animation: slideOut 0.3s ease-in;
        }

        .animate-progress {
          animation: progress linear;
        }
      `}</style>
    </div>
  );
};

export default Notification;
