import React, { useState } from "react";
import { GrOverview } from "react-icons/gr";
import { HiUserGroup } from "react-icons/hi";
import { IoIosPersonAdd } from "react-icons/io";
import { MdManageAccounts } from "react-icons/md";
import { RiSidebarUnfoldFill } from "react-icons/ri";
import { Link, Outlet } from "react-router";

const DashboardLayout = () => {
  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState(false);
  const handleCloseModal = () => {
    setIsStudentMenuOpen(false);
  };

  const [isAdmissionMenuOpen, setIsAdmissionMenuOpen] = useState(false);
  const handleCloseAdmissionModal = () => {
    setIsAdmissionMenuOpen(false);
  };
  
  const [isAttendenceMenuOpen, setIsAttendenceMenuOpen] = useState(false);
  const handleCloseAttendenceModal = () => {
    setIsAttendenceMenuOpen(false);
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Navbar */}
        <nav className="navbar w-full bg-base-300">
          <label
            htmlFor="my-drawer-4"
            aria-label="open sidebar"
            className="btn btn-square btn-ghost"
          >
            {/* Sidebar toggle icon */}
            <RiSidebarUnfoldFill className="text-2xl" />
          </label>
          <div className="px-4">Rootx Coaching Management System</div>
        </nav>
        {/* Page content here */}
        <div className="p-4">
          <Outlet></Outlet>
        </div>
      </div>
      <div className="drawer-side is-drawer-close:overflow-visible">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
          {/* Sidebar content here */}
          <ul className="menu w-full grow">
            {/* Overview */}
            <Link to="/dashboard/overview">
              <li>
                <button
                  className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                  data-tip="Overview"
                >
                  <GrOverview />
                  <span className="is-drawer-close:hidden">Overview</span>
                </button>
              </li>
            </Link>

            {/* Student Management with nested menu */}
            <li className="relative">
              <button
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Student Management"
                onClick={() => setIsStudentMenuOpen(!isStudentMenuOpen)}
              >
                <MdManageAccounts />
                <span className="is-drawer-close:hidden">
                  Student Management
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-4 is-drawer-close:hidden transition-transform ${
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

              {/* Nested menu for collapsed drawer */}
              {isStudentMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-200 rounded-lg shadow-lg border border-base-300 z-50 min-w-[200px]">
                  <Link to="/dashboard/studentManagement/students">
                    <li>
                      <button
                        onClick={handleCloseModal}
                        className="flex items-center gap-2 w-full"
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
                        <span>All Students</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/studentManagement/addStudents">
                    <li>
                      <button
                        onClick={handleCloseModal}
                        className="flex items-center gap-2 w-full"
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
                        <span>Add Student</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Student Management Links for open drawer */}
            {isStudentMenuOpen && (
              <ul className="is-drawer-close:hidden">
                <Link to="/dashboard/studentManagement/students">
                  <li>
                    <button className="pl-12 flex items-center gap-2">
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
                      <span>All Students</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/studentManagement/addStudents">
                  <li>
                    <button className="pl-12 flex items-center gap-2">
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
                      <span>Add Student</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}

            {/* Admission Management with nested menu */}
            <li className="relative">
              <button
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Admission Management"
                onClick={() => setIsAdmissionMenuOpen(!isAdmissionMenuOpen)}
              >
                <IoIosPersonAdd />
                <span className="is-drawer-close:hidden">
                  Admission Management
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-4 is-drawer-close:hidden transition-transform ${
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

              {/* Nested menu for collapsed drawer */}
              {isAdmissionMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-200 rounded-lg shadow-lg border border-base-300 z-50 min-w-[200px]">
                  <Link to="/dashboard/admissionManagement/admissions">
                    <li>
                      <button
                        onClick={handleCloseAdmissionModal}
                        className="flex items-center gap-2 w-full"
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
                        <span>Admissions</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/admissionManagement/newAdmission">
                    <li>
                      <button
                        onClick={handleCloseAdmissionModal}
                        className="flex items-center gap-2 w-full"
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
                        <span>New Admissions</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/admissionManagement/admissionFollowUps">
                    <li>
                      <button
                        onClick={handleCloseAdmissionModal}
                        className="flex items-center gap-2 w-full"
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
                        <span>Admission Follow Ups</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Admission Management Links for open drawer */}
            {isAdmissionMenuOpen && (
              <ul className="is-drawer-close:hidden">
                <Link to="/dashboard/admissionManagement/admissions">
                  <li>
                    <button className="pl-12 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        fill="none"
                        stroke="currentColor"
                        className="inline-block size-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Admissions</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/admissionManagement/newAdmission">
                  <li>
                    <button className="pl-12 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        fill="none"
                        stroke="currentColor"
                        className="inline-block size-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>New Admission</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/admissionManagement/admissionFollowUps">
                  <li>
                    <button className="pl-12 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        fill="none"
                        stroke="currentColor"
                        className="inline-block size-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Admission Follow Ups</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}

            {/* Attendence Management with nested menu */}
            <li className="relative">
              <button
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Admission Management"
                onClick={() => setIsAttendenceMenuOpen(!isAttendenceMenuOpen)}
              >
                <HiUserGroup />
                <span className="is-drawer-close:hidden">
                  Attendence Management
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className={`ml-auto inline-block size-4 is-drawer-close:hidden transition-transform ${
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

              {/* Nested menu for collapsed drawer */}
              {isAttendenceMenuOpen && (
                <ul className="is-drawer-open:hidden absolute left-full top-0 ml-2 bg-base-200 rounded-lg shadow-lg border border-base-300 z-50 min-w-[200px]">
                  <Link to="/dashboard/admissionManagement/admissions">
                    <li>
                      <button
                        onClick={handleCloseAttendenceModal}
                        className="flex items-center gap-2 w-full"
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
                        <span>Attendence</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/admissionManagement/newAdmission">
                    <li>
                      <button
                        onClick={handleCloseAttendenceModal}
                        className="flex items-center gap-2 w-full"
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
                        <span>Attendence Live</span>
                      </button>
                    </li>
                  </Link>
                  <Link to="/dashboard/admissionManagement/admissionFollowUps">
                    <li>
                      <button
                        onClick={handleCloseAttendenceModal}
                        className="flex items-center gap-2 w-full"
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
                        <span>Attendence Reports</span>
                      </button>
                    </li>
                  </Link>
                </ul>
              )}
            </li>

            {/* Nested Attendence Management Links for open drawer */}
            {isAttendenceMenuOpen && (
              <ul className="is-drawer-close:hidden">
                <Link to="/dashboard/admissionManagement/admissions">
                  <li>
                    <button className="pl-12 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        fill="none"
                        stroke="currentColor"
                        className="inline-block size-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Attendence</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/admissionManagement/newAdmission">
                  <li>
                    <button className="pl-12 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        fill="none"
                        stroke="currentColor"
                        className="inline-block size-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Attendence Live</span>
                    </button>
                  </li>
                </Link>
                <Link to="/dashboard/admissionManagement/admissionFollowUps">
                  <li>
                    <button className="pl-12 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        fill="none"
                        stroke="currentColor"
                        className="inline-block size-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Attendence Reports</span>
                    </button>
                  </li>
                </Link>
              </ul>
            )}

            {/* Settings */}
            <li>
              <button
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                data-tip="Settings"
              >
                {/* Settings icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className="my-1.5 inline-block size-4"
                >
                  <path d="M20 7h-9"></path>
                  <path d="M14 17H5"></path>
                  <circle cx="17" cy="17" r="3"></circle>
                  <circle cx="7" cy="7" r="3"></circle>
                </svg>
                <span className="is-drawer-close:hidden">Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
