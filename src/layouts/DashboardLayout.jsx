import React, { useState, useEffect } from "react";
import {
  FaBookOpen,
  FaUserGraduate,
  FaUserPlus,
  FaUsers,
  FaCalendarCheck,
  FaChartLine,
  FaClipboardList,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaChartPie,
  FaClipboardCheck,
  FaSignOutAlt,
  FaUserCircle,
  FaCog,
} from "react-icons/fa";
import { GrDocumentPerformance, GrOverview } from "react-icons/gr";
import { HiUserGroup, HiDocumentReport } from "react-icons/hi";
import { IoIosPersonAdd } from "react-icons/io";
import {
  MdManageAccounts,
  MdPayments,
  MdLightMode,
  MdDarkMode,
  MdPersonAdd,
  MdFollowTheSigns,
  MdLiveTv,
  MdAssessment,
  MdAddCircle,
  MdViewList,
} from "react-icons/md";
import { RiSidebarUnfoldFill } from "react-icons/ri";
import { BsFileEarmarkText, BsGraphUp } from "react-icons/bs";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import Logo from "../components/Logo";
import useAuth from "../hooks/useAuth";

const DashboardLayout = () => {
  // Get current location for active route highlighting
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  // Default profile image
  const defaultProfileImage =
    "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

  // Helper function to check if a route or its children are active
  const isRouteActive = (path) => location.pathname.startsWith(path);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Consolidated menu state with auto-close functionality
  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState(false);
  const [isAdmissionMenuOpen, setIsAdmissionMenuOpen] = useState(false);
  const [isAttendenceMenuOpen, setIsAttendenceMenuOpen] = useState(false);
  const [isFinanceMenuOpen, setIsFinanceMenuOpen] = useState(false);
  const [isBatchMenuOpen, setIsBatchMenuOpen] = useState(false);
  const [isPerformanceMenuOpen, setIsPerformanceMenuOpen] = useState(false);

  // Handle menu toggle with auto-close (only one menu open at a time)
  const handleMenuToggle = (menuName) => {
    switch (menuName) {
      case "student":
        setIsStudentMenuOpen(!isStudentMenuOpen);
        setIsAdmissionMenuOpen(false);
        setIsAttendenceMenuOpen(false);
        setIsFinanceMenuOpen(false);
        setIsBatchMenuOpen(false);
        setIsPerformanceMenuOpen(false);
        break;
      case "admission":
        setIsAdmissionMenuOpen(!isAdmissionMenuOpen);
        setIsStudentMenuOpen(false);
        setIsAttendenceMenuOpen(false);
        setIsFinanceMenuOpen(false);
        setIsBatchMenuOpen(false);
        setIsPerformanceMenuOpen(false);
        break;
      case "attendence":
        setIsAttendenceMenuOpen(!isAttendenceMenuOpen);
        setIsStudentMenuOpen(false);
        setIsAdmissionMenuOpen(false);
        setIsFinanceMenuOpen(false);
        setIsBatchMenuOpen(false);
        setIsPerformanceMenuOpen(false);
        break;
      case "finance":
        setIsFinanceMenuOpen(!isFinanceMenuOpen);
        setIsStudentMenuOpen(false);
        setIsAdmissionMenuOpen(false);
        setIsAttendenceMenuOpen(false);
        setIsBatchMenuOpen(false);
        setIsPerformanceMenuOpen(false);
        break;
      case "batch":
        setIsBatchMenuOpen(!isBatchMenuOpen);
        setIsStudentMenuOpen(false);
        setIsAdmissionMenuOpen(false);
        setIsAttendenceMenuOpen(false);
        setIsFinanceMenuOpen(false);
        setIsPerformanceMenuOpen(false);
        break;
      case "performance":
        setIsPerformanceMenuOpen(!isPerformanceMenuOpen);
        setIsStudentMenuOpen(false);
        setIsAdmissionMenuOpen(false);
        setIsAttendenceMenuOpen(false);
        setIsFinanceMenuOpen(false);
        setIsBatchMenuOpen(false);
        break;
      default:
        break;
    }
  };

  // Close handlers for individual menus
  const handleCloseModal = () => setIsStudentMenuOpen(false);
  const handleCloseAdmissionModal = () => setIsAdmissionMenuOpen(false);
  const handleCloseAttendenceModal = () => setIsAttendenceMenuOpen(false);
  const handleCloseFinanceModal = () => setIsFinanceMenuOpen(false);
  const handleCloseBatchModal = () => setIsBatchMenuOpen(false);
  const handleClosePerformanceModal = () => setIsPerformanceMenuOpen(false);

  // Theme Toggle State - Initialize from localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("rootx-theme") || "rootxlight";
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "rootxlight" ? "rootxdark" : "rootxlight";
    setTheme(newTheme);
    localStorage.setItem("rootx-theme", newTheme);
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Enhanced Navbar - Sticky with Glassmorphism */}
        <nav className="navbar w-full bg-base-100/95 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-base-300 px-2 sm:px-4 min-h-16">
          <div className="flex-none">
            <label
              htmlFor="my-drawer-4"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost hover:bg-primary/10 hover:text-primary transition-all duration-200 active:scale-95"
            >
              <RiSidebarUnfoldFill className="text-xl sm:text-2xl" />
            </label>
          </div>

          {/* Logo - Hidden on small screens */}
          <div className="flex-none hidden sm:block">
            <Logo />
          </div>

          {/* Theme Toggle Button - Center on mobile, middle on desktop */}
          <div className="flex-1 flex justify-center sm:justify-center">
            <button
              onClick={toggleTheme}
              className="btn btn-circle btn-ghost hover:bg-primary/10 hover:text-primary hover:rotate-180 transition-all duration-500 active:scale-95"
              title={`Switch to ${
                theme === "rootxlight" ? "dark" : "light"
              } mode`}
            >
              {theme === "rootxlight" ? (
                <MdDarkMode className="text-xl sm:text-2xl" />
              ) : (
                <MdLightMode className="text-xl sm:text-2xl" />
              )}
            </button>
          </div>

          {/* User Profile Section */}
          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar hover:bg-primary/10 transition-all duration-200"
              >
                <div className="w-8 sm:w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all duration-300">
                  <img
                    alt="User profile"
                    src={user?.photoURL || defaultProfileImage}
                    onError={(e) => {
                      e.target.src = defaultProfileImage;
                    }}
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-64 sm:w-72 p-3 shadow-xl border border-base-300"
              >
                {/* User Info Header */}
                <li className="menu-title px-3 py-2">
                  <div className="flex items-center gap-3 py-2">
                    <div className="avatar">
                      <div className="w-12 sm:w-14 rounded-full ring-2 ring-primary/30">
                        <img
                          src={user?.photoURL || defaultProfileImage}
                          alt="Profile"
                          onError={(e) => {
                            e.target.src = defaultProfileImage;
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-base-content text-sm sm:text-base truncate">
                        {user?.displayName || "User"}
                      </span>
                      <span className="text-xs text-base-content/60 truncate">
                        {user?.email || "user@example.com"}
                      </span>
                    </div>
                  </div>
                </li>

                <div className="divider my-1"></div>

                {/* Profile Link */}
                <li>
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                  >
                    <FaUserCircle className="text-lg" />
                    <span className="text-sm">My Profile</span>
                  </Link>
                </li>

                {/* Settings Link */}
                <li>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                  >
                    <FaCog className="text-lg" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </li>

                <div className="divider my-1"></div>

                {/* Logout Button */}
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-error/10 hover:text-error transition-all duration-200 rounded-lg font-medium"
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span className="text-sm">Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Page content with enhanced background */}
        <div className="p-4 lg:p-6 min-h-screen bg-base-100">
          <Outlet></Outlet>
        </div>

        {/* Professional Footer */}
        <footer className="bg-base-200 border-t border-base-300 py-6 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/70">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-primary">
                  Rootx Software
                </span>
                . All rights reserved.
              </div>
              <div className="flex gap-6 text-sm">
                <a
                  href="https://www.rootxsoftwares.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base-content/70 hover:text-primary transition-colors duration-200"
                >
                  Website
                </a>
                {/* <a
                  href="https://rootssoftware.com/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base-content/70 hover:text-primary transition-colors duration-200"
                >
                  Support
                </a>
                <a
                  href="https://rootssoftware.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base-content/70 hover:text-primary transition-colors duration-200"
                >
                  Privacy
                </a> */}
              </div>
            </div>
          </div>
        </footer>
      </div>
      <div className="drawer-side is-drawer-close:overflow-visible z-50">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="flex min-h-full flex-col items-start bg-base-100 border-r border-base-300 shadow-lg is-drawer-close:w-14 is-drawer-open:w-64 is-drawer-close:overflow-visible">
          {/* Sidebar content here */}
          <ul className="menu w-full grow px-2 py-4 sidebar-scroll overflow-y-auto is-drawer-close:overflow-visible">
            {/* Overview */}
            <Link to="/dashboard/overview">
              <li>
                <button
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 ${
                    location.pathname === "/dashboard/overview"
                      ? "bg-primary text-primary-content font-semibold shadow-md"
                      : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                  }`}
                  data-tip="Overview"
                >
                  <GrOverview className="text-xl" />
                  <span className="is-drawer-close:hidden">Overview</span>
                </button>
              </li>
            </Link>

            {/* Student Management with nested menu */}
            <li className="relative">
              <button
                className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 ${
                  isRouteActive("/dashboard/studentManagement")
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                }`}
                data-tip="Student Management"
                onClick={() => handleMenuToggle("student")}
              >
                <MdManageAccounts className="text-xl" />
                <span className="is-drawer-close:hidden">
                  Student Management
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-4 is-drawer-close:hidden transition-transform duration-300 ${
                    isStudentMenuOpen ? "rotate-90" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Nested menu for collapsed drawer (Popup) */}
              {isStudentMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-100 rounded-lg shadow-xl border border-base-300 z-100 min-w-55 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                  <Link to="/dashboard/studentManagement/students">
                    <li>
                      <button
                        onClick={handleCloseModal}
                        className={`flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 ${
                          location.pathname ===
                          "/dashboard/studentManagement/students"
                            ? "bg-primary text-primary-content font-semibold"
                            : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                        }`}
                      >
                        <FaUserGraduate className="inline-block size-4" />
                        <span>All Students</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/studentManagement/addStudents">
                    <li>
                      <button
                        onClick={handleCloseModal}
                        className={`flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 ${
                          location.pathname ===
                          "/dashboard/studentManagement/addStudents"
                            ? "bg-primary text-primary-content font-semibold"
                            : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                        }`}
                      >
                        <MdPersonAdd className="inline-block size-4" />
                        <span>Add Student</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Student Management Links for open drawer */}
            {isStudentMenuOpen && (
              <ul className="is-drawer-close:hidden animate-[slideDown_0.3s_ease-out]">
                <Link to="/dashboard/studentManagement/students">
                  <li>
                    <button
                      className={`pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                        location.pathname ===
                        "/dashboard/studentManagement/students"
                          ? "bg-primary text-primary-content font-semibold"
                          : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      }`}
                    >
                      <FaUserGraduate className="inline-block size-4" />
                      <span className="text-sm">All Students</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/studentManagement/addStudents">
                  <li>
                    <button
                      className={`pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                        location.pathname ===
                        "/dashboard/studentManagement/addStudents"
                          ? "bg-primary text-primary-content font-semibold"
                          : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      }`}
                    >
                      <MdPersonAdd className="inline-block size-4" />
                      <span className="text-sm">Add Student</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}

            {/* Admission Management with nested menu */}
            <li className="relative">
              <button
                className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 ${
                  isRouteActive("/dashboard/admissionManagement")
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                }`}
                data-tip="Admission Management"
                onClick={() => handleMenuToggle("admission")}
              >
                <IoIosPersonAdd className="text-xl" />
                <span className="is-drawer-close:hidden">
                  Admission Management
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-4 is-drawer-close:hidden transition-transform duration-300 ${
                    isAdmissionMenuOpen ? "rotate-90" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Nested menu for collapsed drawer (Popup) */}
              {isAdmissionMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-100 rounded-lg shadow-xl border border-base-300 z-100 min-w-55 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                  <Link to="/dashboard/admissionManagement/admissions">
                    <li>
                      <button
                        onClick={handleCloseAdmissionModal}
                        className={`flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 ${
                          location.pathname ===
                          "/dashboard/admissionManagement/admissions"
                            ? "bg-primary text-primary-content font-semibold"
                            : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                        }`}
                      >
                        <FaUsers className="inline-block size-4" />
                        <span>Admissions</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/admissionManagement/newAdmission">
                    <li>
                      <button
                        onClick={handleCloseAdmissionModal}
                        className={`flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 ${
                          location.pathname ===
                          "/dashboard/admissionManagement/newAdmission"
                            ? "bg-primary text-primary-content font-semibold"
                            : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                        }`}
                      >
                        <FaUserPlus className="inline-block size-4" />
                        <span>New Admissions</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/admissionManagement/admissionFollowUps">
                    <li>
                      <button
                        onClick={handleCloseAdmissionModal}
                        className={`flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 ${
                          location.pathname ===
                          "/dashboard/admissionManagement/admissionFollowUps"
                            ? "bg-primary text-primary-content font-semibold"
                            : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                        }`}
                      >
                        <MdFollowTheSigns className="inline-block size-4" />
                        <span>Admission Follow Ups</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Admission Management Links for open drawer */}
            {isAdmissionMenuOpen && (
              <ul className="is-drawer-close:hidden animate-[slideDown_0.3s_ease-out]">
                <Link to="/dashboard/admissionManagement/admissions">
                  <li>
                    <button
                      className={`pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                        location.pathname ===
                        "/dashboard/admissionManagement/admissions"
                          ? "bg-primary text-primary-content font-semibold"
                          : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      }`}
                    >
                      <FaUsers className="inline-block size-4" />
                      <span className="text-sm">Admissions</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/admissionManagement/newAdmission">
                  <li>
                    <button
                      className={`pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                        location.pathname ===
                        "/dashboard/admissionManagement/newAdmission"
                          ? "bg-primary text-primary-content font-semibold"
                          : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      }`}
                    >
                      <FaUserPlus className="inline-block size-4" />
                      <span className="text-sm">New Admission</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/admissionManagement/admissionFollowUps">
                  <li>
                    <button
                      className={`pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                        location.pathname ===
                        "/dashboard/admissionManagement/admissionFollowUps"
                          ? "bg-primary text-primary-content font-semibold"
                          : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      }`}
                    >
                      <MdFollowTheSigns className="inline-block size-4" />
                      <span className="text-sm">Admission Follow Ups</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}

            {/* Attendence Management with nested menu */}
            <li className="relative">
              <button
                className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 ${
                  isRouteActive("/dashboard/attendenceManagement")
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                }`}
                data-tip="Attendence Management"
                onClick={() => handleMenuToggle("attendence")}
              >
                <HiUserGroup className="text-xl" />
                <span className="is-drawer-close:hidden">
                  Attendence Management
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-4 is-drawer-close:hidden transition-transform duration-300 ${
                    isAttendenceMenuOpen ? "rotate-90" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Nested menu for collapsed drawer (Popup) */}
              {isAttendenceMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-100 rounded-lg shadow-xl border border-base-300 z-100 min-w-55 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                  <Link to="/dashboard/attendenceManagement/attendence">
                    <li>
                      <button
                        onClick={handleCloseAttendenceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          fill="none"
                          stroke="currentColor"
                          className="inline-block size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        <FaClipboardCheck className="inline-block size-4 mr-2" />
                        <span>Attendance</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/attendenceManagement/attendenceLive">
                    <li>
                      <button
                        onClick={handleCloseAttendenceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          fill="none"
                          stroke="currentColor"
                          className="inline-block size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <MdLiveTv className="inline-block size-4 mr-2" />
                        <span>Attendance Live</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/attendenceManagement/attendenceReports">
                    <li>
                      <button
                        onClick={handleCloseAttendenceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          fill="none"
                          stroke="currentColor"
                          className="inline-block size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <HiDocumentReport className="inline-block size-4 mr-2" />
                        <span>Attendance Reports</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Attendence Management Links for open drawer */}
            {isAttendenceMenuOpen && (
              <ul className="is-drawer-close:hidden animate-[slideDown_0.3s_ease-out]">
                <Link to="/dashboard/attendenceManagement/attendence">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <FaClipboardCheck className="inline-block size-4" />
                      <span className="text-sm">Attendance</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/attendenceManagement/attendenceLive">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <MdLiveTv className="inline-block size-4" />
                      <span className="text-sm">Attendance Live</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/attendenceManagement/attendenceReports">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <HiDocumentReport className="inline-block size-4" />
                      <span className="text-sm">Attendance Reports</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}

            {/* Finance Management with nested menu */}
            <li className="relative">
              <button
                className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 ${
                  isRouteActive("/dashboard/financeManagement")
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                }`}
                data-tip="Finance Management"
                onClick={() => handleMenuToggle("finance")}
              >
                <MdPayments className="text-xl" />
                <span className="is-drawer-close:hidden">
                  Finance Management
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-4 is-drawer-close:hidden transition-transform duration-300 ${
                    isFinanceMenuOpen ? "rotate-90" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Nested menu for collapsed drawer (Popup) */}
              {isFinanceMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-100 rounded-lg shadow-xl border border-base-300 z-100 min-w-55 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                  <Link to="/dashboard/financeManagement/finances">
                    <li>
                      <button
                        onClick={handleCloseFinanceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <FaMoneyBillWave className="inline-block size-4 mr-2" />
                        <span>Finance</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/financeManagement/newFeeEntry">
                    <li>
                      <button
                        onClick={handleCloseFinanceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <MdPersonAdd className="inline-block size-4 mr-2" />
                        <span>New Fee Entry</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/financeManagement/financesCollected">
                    <li>
                      <button
                        onClick={handleCloseFinanceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <FaFileInvoiceDollar className="inline-block size-4 mr-2" />
                        <span>Fees Collected</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/financeManagement/financesDues">
                    <li>
                      <button
                        onClick={handleCloseFinanceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <FaMoneyBillWave className="inline-block size-4 mr-2 text-error" />
                        <span>Fees Dues</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/financeManagement/financesReports">
                    <li>
                      <button
                        onClick={handleCloseFinanceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <FaChartPie className="inline-block size-4 mr-2" />
                        <span>Fees Reports</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Finance Management Links for open drawer */}
            {isFinanceMenuOpen && (
              <ul className="is-drawer-close:hidden animate-[slideDown_0.3s_ease-out]">
                <Link to="/dashboard/financeManagement/finances">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <FaMoneyBillWave className="inline-block size-4" />
                      <span className="text-sm">Finance</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/financeManagement/newFeeEntry">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <MdPersonAdd className="inline-block size-4" />
                      <span className="text-sm">New Fee Entry</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/financeManagement/financesCollected">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <FaFileInvoiceDollar className="inline-block size-4" />
                      <span className="text-sm">Fees Collected</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/financeManagement/financesDues">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <FaMoneyBillWave className="inline-block size-4 text-error" />
                      <span className="text-sm">Fees Dues</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/financeManagement/financesReports">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <FaChartPie className="inline-block size-4" />
                      <span className="text-sm">Fees Report</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}

            {/* Batch Management with nested menu */}
            <li className="relative">
              <button
                className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 ${
                  isRouteActive("/dashboard/batchManagement")
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                }`}
                data-tip="Batch Management"
                onClick={() => handleMenuToggle("batch")}
              >
                <FaBookOpen className="text-xl" />
                <span className="is-drawer-close:hidden">Batch Management</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-4 is-drawer-close:hidden transition-transform duration-300 ${
                    isBatchMenuOpen ? "rotate-90" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Nested menu for collapsed drawer (Popup) */}
              {isBatchMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-100 rounded-lg shadow-xl border border-base-300 z-100 min-w-55 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                  <Link to="/dashboard/batchManagement/batches">
                    <li>
                      <button
                        onClick={handleCloseBatchModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <MdViewList className="inline-block size-4 mr-2" />
                        <span>Batches</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/batchManagement/createBatches">
                    <li>
                      <button
                        onClick={handleCloseBatchModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <MdAddCircle className="inline-block size-4 mr-2" />
                        <span>Create Batch</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Batch Management Links for open drawer */}
            {isBatchMenuOpen && (
              <ul className="is-drawer-close:hidden animate-[slideDown_0.3s_ease-out]">
                <Link to="/dashboard/batchManagement/batches">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <MdViewList className="inline-block size-4" />
                      <span className="text-sm">Batches</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/batchManagement/createBatches">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <MdAddCircle className="inline-block size-4" />
                      <span className="text-sm">Create Batch</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}

            {/* Performance Tracking with nested menu */}
            <li className="relative">
              <button
                className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 ${
                  isRouteActive("/dashboard/performanceManagement")
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                }`}
                data-tip="Performance Tracking"
                onClick={() => handleMenuToggle("performance")}
              >
                <GrDocumentPerformance className="text-xl" />
                <span className="is-drawer-close:hidden">
                  Performance Tracking
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-4 is-drawer-close:hidden transition-transform duration-300 ${
                    isPerformanceMenuOpen ? "rotate-90" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Nested menu for collapsed drawer (Popup) */}
              {isPerformanceMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-100 rounded-lg shadow-xl border border-base-300 z-100 min-w-55 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                  <Link to="/dashboard/performanceManagement/exams">
                    <li>
                      <button
                        onClick={handleClosePerformanceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <BsFileEarmarkText className="inline-block size-4 mr-2" />
                        <span>Exams</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/performanceManagement/examsResults">
                    <li>
                      <button
                        onClick={handleClosePerformanceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <MdAssessment className="inline-block size-4 mr-2" />
                        <span>Exams Results</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/performanceManagement/examsAnalytics">
                    <li>
                      <button
                        onClick={handleClosePerformanceModal}
                        className="flex items-center gap-3 w-full transition-all duration-200 px-4 py-3 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      >
                        <BsGraphUp className="inline-block size-4 mr-2" />
                        <span>Exams Analytics</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Performance Tracking Links for open drawer */}
            {isPerformanceMenuOpen && (
              <ul className="is-drawer-close:hidden animate-[slideDown_0.3s_ease-out]">
                <Link to="/dashboard/performanceManagement/exams">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <BsFileEarmarkText className="inline-block size-4" />
                      <span className="text-sm">Exams</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/performanceManagement/examsResults">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <MdAssessment className="inline-block size-4" />
                      <span className="text-sm">Exams Results</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/performanceManagement/examsAnalytics">
                  <li>
                    <button className="pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:translate-x-1">
                      <BsGraphUp className="inline-block size-4 mr-2" />
                      <span>Exams Analytics</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
