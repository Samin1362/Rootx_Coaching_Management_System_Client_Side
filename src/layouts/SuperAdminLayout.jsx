import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaUsers,
  FaCreditCard,
  FaChartLine,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaCrown,
  FaShieldAlt,
} from "react-icons/fa";
import { GrOverview } from "react-icons/gr";
import { MdLightMode, MdDarkMode, MdAddBusiness } from "react-icons/md";
import { RiSidebarUnfoldFill } from "react-icons/ri";
import { HiDocumentReport } from "react-icons/hi";
import { BsGraphUp } from "react-icons/bs";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import Logo from "../components/Logo";
import useAuth from "../hooks/useAuth";
import LanguageSwitcher from "../components/LanguageSwitcher";

const SuperAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loader, logoutUser, isSuperAdmin, dbUser, dbUserLoading } = useAuth();

  // Protect super admin routes - redirect to login if not authenticated
  useEffect(() => {
    if (!loader && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loader, navigate]);

  // Check if user is super admin (wait for dbUser to load)
  useEffect(() => {
    if (!loader && !dbUserLoading && user && dbUser) {
      // If not super admin, redirect to regular dashboard
      if (!isSuperAdmin) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loader, dbUserLoading, dbUser, isSuperAdmin, navigate]);

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

  // Menu state for nested menus
  const [isOrganizationsMenuOpen, setIsOrganizationsMenuOpen] = useState(false);
  const [isSubscriptionsMenuOpen, setIsSubscriptionsMenuOpen] = useState(false);

  // Handle menu toggle with auto-close (only one menu open at a time)
  const handleMenuToggle = (menuName) => {
    switch (menuName) {
      case "organizations":
        setIsOrganizationsMenuOpen(!isOrganizationsMenuOpen);
        setIsSubscriptionsMenuOpen(false);
        break;
      case "subscriptions":
        setIsSubscriptionsMenuOpen(!isSubscriptionsMenuOpen);
        setIsOrganizationsMenuOpen(false);
        break;
      default:
        break;
    }
  };

  // Close handlers for individual menus
  const handleCloseOrganizationsModal = () => setIsOrganizationsMenuOpen(false);
  const handleCloseSubscriptionsModal = () => setIsSubscriptionsMenuOpen(false);

  // Theme Toggle State - Initialize from localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("rootx-theme") || "rootxlight";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "rootxlight" ? "rootxdark" : "rootxlight";
    setTheme(newTheme);
    localStorage.setItem("rootx-theme", newTheme);
  };

  // Show loading while checking authentication and user role
  if (loader || dbUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60">
            {dbUserLoading ? "Verifying admin access..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not super admin
  if (!user || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="super-admin-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Navbar */}
        <nav className="navbar w-full bg-base-100/95 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-base-300 px-2 sm:px-4 min-h-16">
          <div className="flex-none">
            <label
              htmlFor="super-admin-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost hover:bg-primary/10 hover:text-primary transition-all duration-200 active:scale-95"
            >
              <RiSidebarUnfoldFill className="text-xl sm:text-2xl" />
            </label>
          </div>

          {/* Logo - Hidden on small screens */}
          <div className="flex-none hidden sm:flex items-center gap-2">
            <Logo />
            <span className="badge badge-primary badge-sm">Super Admin</span>
          </div>

          {/* Theme Toggle & Language Switcher */}
          <div className="flex-1 flex justify-center sm:justify-center gap-1 sm:gap-2">
            <button
              onClick={toggleTheme}
              className="btn btn-circle btn-ghost hover:bg-primary/10 hover:text-primary hover:rotate-180 transition-all duration-500 active:scale-95"
              title={theme === "rootxlight" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "rootxlight" ? (
                <MdDarkMode className="text-xl sm:text-2xl" />
              ) : (
                <MdLightMode className="text-xl sm:text-2xl" />
              )}
            </button>
            <LanguageSwitcher />
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
                    src={dbUser?.photoURL || user?.photoURL || defaultProfileImage}
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
                          src={dbUser?.photoURL || user?.photoURL || defaultProfileImage}
                          alt="Profile"
                          onError={(e) => {
                            e.target.src = defaultProfileImage;
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-base-content text-sm sm:text-base truncate">
                        {dbUser?.name || user?.displayName || "Super Admin"}
                      </span>
                      <span className="text-xs text-base-content/60 truncate">
                        {user?.email || "admin@example.com"}
                      </span>
                      <span className="badge badge-primary badge-xs mt-1">Super Admin</span>
                    </div>
                  </div>
                </li>

                <div className="divider my-1"></div>

                {/* Profile Link */}
                <li>
                  <Link
                    to="/super-admin/profile"
                    className="flex items-center gap-3 px-3 py-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                  >
                    <FaUserCircle className="text-lg" />
                    <span className="text-base">My Profile</span>
                  </Link>
                </li>

                {/* Settings Link */}
                <li>
                  <Link
                    to="/super-admin/settings"
                    className="flex items-center gap-3 px-3 py-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
                  >
                    <FaCog className="text-lg" />
                    <span className="text-base">Platform Settings</span>
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
                    <span className="text-base">Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="p-4 lg:p-6 min-h-screen bg-base-100">
          <Outlet></Outlet>
        </div>

        {/* Footer */}
        <footer className="bg-base-200 border-t border-base-300 py-6 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-base-content/70">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-primary">Rootx Software</span>. All rights reserved.
              </div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-primary" />
                <span className="text-sm text-base-content/70">Super Admin Panel</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Sidebar */}
      <div className="drawer-side is-drawer-close:overflow-visible z-50">
        <label
          htmlFor="super-admin-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="flex min-h-full flex-col items-start bg-base-100 border-r border-base-300 shadow-lg is-drawer-close:w-14 is-drawer-open:w-64 is-drawer-close:overflow-visible">
          {/* Sidebar Header */}
          <div className="w-full p-4 border-b border-base-300 is-drawer-close:hidden">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-2xl text-primary" />
              <span className="font-bold text-lg">Super Admin</span>
            </div>
          </div>

          {/* Sidebar content */}
          <ul className="menu w-full grow px-2 py-4 sidebar-scroll overflow-y-auto is-drawer-close:overflow-visible">
            {/* Dashboard Overview */}
            <Link to="/super-admin/dashboard">
              <li>
                <button
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 py-3 ${
                    location.pathname === "/super-admin/dashboard"
                      ? "bg-primary text-primary-content font-semibold shadow-md"
                      : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                  }`}
                  data-tip="Dashboard"
                >
                  <GrOverview className="text-2xl" />
                  <span className="is-drawer-close:hidden text-base font-medium">Dashboard</span>
                </button>
              </li>
            </Link>

            {/* Organizations Management */}
            <li className="relative">
              <button
                className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 py-3 ${
                  isRouteActive("/super-admin/organizations")
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                }`}
                data-tip="Organizations"
                onClick={() => handleMenuToggle("organizations")}
              >
                <FaBuilding className="text-2xl" />
                <span className="is-drawer-close:hidden text-base font-medium">Organizations</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-5 is-drawer-close:hidden transition-transform duration-300 ${
                    isOrganizationsMenuOpen ? "rotate-90" : ""
                  }`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Popup menu for collapsed drawer */}
              {isOrganizationsMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-100 rounded-lg shadow-xl border border-base-300 z-100 min-w-55 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                  <Link to="/super-admin/organizations">
                    <li>
                      <button
                        onClick={handleCloseOrganizationsModal}
                        className={`flex items-center gap-3 w-full transition-all duration-200 px-4 py-3.5 ${
                          location.pathname === "/super-admin/organizations"
                            ? "bg-primary text-primary-content font-semibold"
                            : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                        }`}
                      >
                        <FaBuilding className="inline-block size-5" />
                        <span className="text-base">All Organizations</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/super-admin/organizations/create">
                    <li>
                      <button
                        onClick={handleCloseOrganizationsModal}
                        className={`flex items-center gap-3 w-full transition-all duration-200 px-4 py-3.5 ${
                          location.pathname === "/super-admin/organizations/create"
                            ? "bg-primary text-primary-content font-semibold"
                            : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                        }`}
                      >
                        <MdAddBusiness className="inline-block size-5" />
                        <span className="text-base">Create Organization</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Organizations Links for open drawer */}
            {isOrganizationsMenuOpen && (
              <ul className="is-drawer-close:hidden animate-[slideDown_0.3s_ease-out]">
                <Link to="/super-admin/organizations">
                  <li>
                    <button
                      className={`pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 py-2.5 ${
                        location.pathname === "/super-admin/organizations"
                          ? "bg-primary text-primary-content font-semibold"
                          : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      }`}
                    >
                      <FaBuilding className="inline-block size-5" />
                      <span className="text-base">All Organizations</span>
                    </button>
                  </li>
                </Link>
                <Link to="/super-admin/organizations/create">
                  <li>
                    <button
                      className={`pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 py-2.5 ${
                        location.pathname === "/super-admin/organizations/create"
                          ? "bg-primary text-primary-content font-semibold"
                          : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      }`}
                    >
                      <MdAddBusiness className="inline-block size-5" />
                      <span className="text-base">Create Organization</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}

            {/* Users Management */}
            <Link to="/super-admin/users">
              <li>
                <button
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 py-3 ${
                    location.pathname === "/super-admin/users" ||
                    location.pathname.startsWith("/super-admin/users/")
                      ? "bg-primary text-primary-content font-semibold shadow-md"
                      : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                  }`}
                  data-tip="Users"
                >
                  <FaUsers className="text-2xl" />
                  <span className="is-drawer-close:hidden text-base font-medium">Platform Users</span>
                </button>
              </li>
            </Link>

            {/* Subscriptions Management */}
            <li className="relative">
              <button
                className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 py-3 ${
                  isRouteActive("/super-admin/subscriptions") || isRouteActive("/super-admin/plans")
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                }`}
                data-tip="Subscriptions"
                onClick={() => handleMenuToggle("subscriptions")}
              >
                <FaCreditCard className="text-2xl" />
                <span className="is-drawer-close:hidden text-base font-medium">Subscriptions</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-5 is-drawer-close:hidden transition-transform duration-300 ${
                    isSubscriptionsMenuOpen ? "rotate-90" : ""
                  }`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Popup menu for collapsed drawer */}
              {isSubscriptionsMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-100 rounded-lg shadow-xl border border-base-300 z-100 min-w-55 overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                  <Link to="/super-admin/subscriptions">
                    <li>
                      <button
                        onClick={handleCloseSubscriptionsModal}
                        className={`flex items-center gap-3 w-full transition-all duration-200 px-4 py-3.5 ${
                          location.pathname === "/super-admin/subscriptions"
                            ? "bg-primary text-primary-content font-semibold"
                            : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                        }`}
                      >
                        <FaCreditCard className="inline-block size-5" />
                        <span className="text-base">All Subscriptions</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/super-admin/plans">
                    <li>
                      <button
                        onClick={handleCloseSubscriptionsModal}
                        className={`flex items-center gap-3 w-full transition-all duration-200 px-4 py-3.5 ${
                          location.pathname === "/super-admin/plans"
                            ? "bg-primary text-primary-content font-semibold"
                            : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                        }`}
                      >
                        <FaCrown className="inline-block size-5" />
                        <span className="text-base">Subscription Plans</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Subscriptions Links for open drawer */}
            {isSubscriptionsMenuOpen && (
              <ul className="is-drawer-close:hidden animate-[slideDown_0.3s_ease-out]">
                <Link to="/super-admin/subscriptions">
                  <li>
                    <button
                      className={`pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 py-2.5 ${
                        location.pathname === "/super-admin/subscriptions"
                          ? "bg-primary text-primary-content font-semibold"
                          : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      }`}
                    >
                      <FaCreditCard className="inline-block size-5" />
                      <span className="text-base">All Subscriptions</span>
                    </button>
                  </li>
                </Link>
                <Link to="/super-admin/plans">
                  <li>
                    <button
                      className={`pl-10 flex items-center gap-3 rounded-lg transition-all duration-200 py-2.5 ${
                        location.pathname === "/super-admin/plans"
                          ? "bg-primary text-primary-content font-semibold"
                          : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      }`}
                    >
                      <FaCrown className="inline-block size-5" />
                      <span className="text-base">Subscription Plans</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}

            {/* Divider */}
            <div className="divider is-drawer-close:hidden my-2 text-xs text-base-content/40">
              MONITORING
            </div>

            {/* Activity Logs */}
            <Link to="/super-admin/activity-logs">
              <li>
                <button
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 py-3 ${
                    location.pathname === "/super-admin/activity-logs"
                      ? "bg-primary text-primary-content font-semibold shadow-md"
                      : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                  }`}
                  data-tip="Activity Logs"
                >
                  <FaClipboardList className="text-2xl" />
                  <span className="is-drawer-close:hidden text-base font-medium">Activity Logs</span>
                </button>
              </li>
            </Link>

            {/* Platform Analytics */}
            <Link to="/super-admin/analytics">
              <li>
                <button
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 py-3 ${
                    location.pathname === "/super-admin/analytics"
                      ? "bg-primary text-primary-content font-semibold shadow-md"
                      : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                  }`}
                  data-tip="Analytics"
                >
                  <BsGraphUp className="text-2xl" />
                  <span className="is-drawer-close:hidden text-base font-medium">Platform Analytics</span>
                </button>
              </li>
            </Link>

            {/* Reports */}
            <Link to="/super-admin/reports">
              <li>
                <button
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 py-3 ${
                    location.pathname === "/super-admin/reports"
                      ? "bg-primary text-primary-content font-semibold shadow-md"
                      : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                  }`}
                  data-tip="Reports"
                >
                  <HiDocumentReport className="text-2xl" />
                  <span className="is-drawer-close:hidden text-base font-medium">Reports</span>
                </button>
              </li>
            </Link>

            {/* Divider */}
            <div className="divider is-drawer-close:hidden my-2 text-xs text-base-content/40">
              SETTINGS
            </div>

            {/* Platform Settings */}
            <Link to="/super-admin/settings">
              <li>
                <button
                  className={`is-drawer-close:tooltip is-drawer-close:tooltip-right rounded-lg transition-all duration-200 active:scale-95 py-3 ${
                    location.pathname === "/super-admin/settings"
                      ? "bg-primary text-primary-content font-semibold shadow-md"
                      : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                  }`}
                  data-tip="Settings"
                >
                  <FaCog className="text-2xl" />
                  <span className="is-drawer-close:hidden text-base font-medium">Platform Settings</span>
                </button>
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
