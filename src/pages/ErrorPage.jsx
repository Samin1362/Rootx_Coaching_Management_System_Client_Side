import { useNavigate, useRouteError } from "react-router-dom";
import {
  MdHome,
  MdArrowBack,
  MdError,
  MdWarning,
  MdRefresh,
} from "react-icons/md";
import { FaSadTear } from "react-icons/fa";
import { BiSolidError } from "react-icons/bi";

const ErrorPage = () => {
  const navigate = useNavigate();
  const error = useRouteError();

  // Determine error type and message
  const getErrorDetails = () => {
    if (error?.status === 404) {
      return {
        code: "404",
        title: "Page Not Found",
        message:
          "Oops! The page you're looking for seems to have wandered off. It might have been moved or deleted.",
        icon: <FaSadTear className="text-6xl sm:text-7xl md:text-8xl" />,
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
      };
    } else if (error?.status === 403) {
      return {
        code: "403",
        title: "Access Denied",
        message:
          "You don't have permission to access this resource. Please contact your administrator if you believe this is an error.",
        icon: <MdWarning className="text-6xl sm:text-7xl md:text-8xl" />,
        color: "text-error",
        bgColor: "bg-error/10",
        borderColor: "border-error/20",
      };
    } else if (error?.status === 500) {
      return {
        code: "500",
        title: "Server Error",
        message:
          "Something went wrong on our end. Our team has been notified and is working to fix the issue.",
        icon: <BiSolidError className="text-6xl sm:text-7xl md:text-8xl" />,
        color: "text-error",
        bgColor: "bg-error/10",
        borderColor: "border-error/20",
      };
    } else {
      return {
        code: "ERROR",
        title: "Something Went Wrong",
        message:
          error?.message ||
          "An unexpected error occurred. Please try again or contact support if the problem persists.",
        icon: <MdError className="text-6xl sm:text-7xl md:text-8xl" />,
        color: "text-error",
        bgColor: "bg-error/10",
        borderColor: "border-error/20",
      };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="min-h-screen bg-base-200/30 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Main Error Card */}
        <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300/50 overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="h-2 bg-linear-to-r from-primary via-secondary to-accent"></div>

          <div className="p-8 sm:p-12 md:p-16">
            {/* Error Icon with Animation */}
            <div className="flex justify-center mb-8">
              <div
                className={`${errorDetails.bgColor} ${errorDetails.borderColor} ${errorDetails.color} p-8 rounded-full border-4 animate-bounce`}
                style={{ animationDuration: "2s" }}
              >
                {errorDetails.icon}
              </div>
            </div>

            {/* Error Code */}
            <div className="text-center mb-6">
              <h1
                className={`text-7xl sm:text-8xl md:text-9xl font-black ${errorDetails.color} opacity-20 mb-2`}
              >
                {errorDetails.code}
              </h1>
            </div>

            {/* Error Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-base-content text-center mb-4">
              {errorDetails.title}
            </h2>

            {/* Error Message */}
            <p className="text-base sm:text-lg text-base-content/70 text-center max-w-2xl mx-auto mb-8 leading-relaxed">
              {errorDetails.message}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate("/")}
                className="btn btn-primary text-white w-full sm:w-auto px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <MdHome className="text-xl group-hover:scale-110 transition-transform duration-200" />
                Go to Home
              </button>

              <button
                onClick={() => window.location.reload()}
                className="btn btn-ghost w-full sm:w-auto px-8 group"
              >
                <MdRefresh className="text-xl group-hover:rotate-180 transition-transform duration-500" />
                Refresh Page
              </button>
            </div>

            {/* Additional Help Section */}
            <div className="mt-12 pt-8 border-t border-base-300">
              <div className="text-center">
                <p className="text-sm text-base-content/60 mb-4">
                  Need help? Here are some helpful links:
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="link link-primary text-sm hover:text-primary/80 transition-colors"
                  >
                    Dashboard
                  </button>
                  <span className="text-base-content/30">•</span>
                  <button
                    onClick={() => navigate("/students")}
                    className="link link-primary text-sm hover:text-primary/80 transition-colors"
                  >
                    Students
                  </button>
                  <span className="text-base-content/30">•</span>
                  <button
                    onClick={() => navigate("/batches")}
                    className="link link-primary text-sm hover:text-primary/80 transition-colors"
                  >
                    Batches
                  </button>
                  <span className="text-base-content/30">•</span>
                  <a
                    href="mailto:support@rootssoftware.com"
                    className="link link-primary text-sm hover:text-primary/80 transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>

            {/* Technical Details (for developers) */}
            {error?.statusText && (
              <div className="mt-8 p-4 bg-base-200/50 rounded-xl border border-base-300/50">
                <details className="cursor-pointer">
                  <summary className="text-sm font-semibold text-base-content/70 hover:text-base-content transition-colors">
                    Technical Details
                  </summary>
                  <div className="mt-3 text-xs text-base-content/60 font-mono">
                    <p>
                      <strong>Status:</strong> {error.status}
                    </p>
                    <p>
                      <strong>Message:</strong> {error.statusText}
                    </p>
                    {error.data && (
                      <p>
                        <strong>Details:</strong> {error.data}
                      </p>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <p className="text-xs text-base-content/40">
            © {new Date().getFullYear()} Roots Software. All rights reserved.
          </p>
        </div>
      </div>

      {/* Background Decorative Circles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-accent/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  );
};

export default ErrorPage;
