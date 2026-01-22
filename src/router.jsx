import { createBrowserRouter, Navigate } from "react-router";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/Overview";
import Students from "./pages/StudentManagement/Students";
import AddStudent from "./pages/StudentManagement/AddStudent";
import ErrorPage from "./pages/ErrorPage";
import Admissions from "./pages/Admission&Enrollment/Admissions";
import NewAdmissions from "./pages/Admission&Enrollment/NewAdmissions";
import AdmissionFollowUps from "./pages/Admission&Enrollment/AdmissionFollowUps";
import Attendences from "./pages/AttendenceManagement/Attendences";
import AttendenceLive from "./pages/AttendenceManagement/AttendenceLive";
import AttendenceReports from "./pages/AttendenceManagement/AttendenceReports";
import Finances from "./pages/Fee&FinanceManagement/Finances";
import FeesCollected from "./pages/Fee&FinanceManagement/FeesCollected";
import FeesDues from "./pages/Fee&FinanceManagement/FeesDues";
import FeesReport from "./pages/Fee&FinanceManagement/FeesReport";
import NewFeeEntry from "./pages/Fee&FinanceManagement/NewFeeEntry";
import Expense from "./pages/Fee&FinanceManagement/Expense";
import Batches from "./pages/Batch&ClassManagement/Batches";
import CreateBatches from "./pages/Batch&ClassManagement/CreateBatches";
import Exams from "./pages/Performance&AssessmentTracking/Exams";
import ExamsResults from "./pages/Performance&AssessmentTracking/ExamsResults";
import ExamsAnalytics from "./pages/Performance&AssessmentTracking/ExamsAnalytics";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import OrganizationSignup from "./pages/Organization/OrganizationSignup";
import WaitingForOrganization from "./pages/WaitingForOrganization";
import SubscriptionPlans from "./pages/Subscription/SubscriptionPlans";
import SubscriptionManagement from "./pages/Subscription/SubscriptionManagement";
import UserManagement from "./pages/UserManagement/UserManagement";
import OrganizationSettings from "./pages/Organization/OrganizationSettings";

const router = createBrowserRouter([
  // Root path redirects to signup (for new organizations)
  {
    path: "/",
    element: <Navigate to="/signup" replace />,
  },
  // Organization Signup (Public)
  {
    path: "/signup",
    Component: OrganizationSignup,
    errorElement: <ErrorPage></ErrorPage>,
  },
  // Subscription Plans (Public)
  {
    path: "/plans",
    Component: SubscriptionPlans,
    errorElement: <ErrorPage></ErrorPage>,
  },
  // Waiting for Organization (Public)
  {
    path: "/waiting-for-organization",
    Component: WaitingForOrganization,
    errorElement: <ErrorPage></ErrorPage>,
  },
  // Auth routes (Login and Register)
  {
    path: "/",
    Component: AuthLayout,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
    ],
  },
  // Dashboard routes (Protected)
  {
    path: "/dashboard",
    Component: DashboardLayout,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/overview" replace />,
      },
      {
        path: "overview",
        Component: Overview,
      },
      {
        path: "studentManagement",
        children: [
          {
            path: "students",
            Component: Students,
          },
          {
            path: "addStudents",
            Component: AddStudent,
          },
        ],
      },
      {
        path: "admissionManagement",
        children: [
          {
            path: "admissions",
            Component: Admissions,
          },
          {
            path: "newAdmission",
            Component: NewAdmissions,
          },
          {
            path: "admissionFollowUps",
            Component: AdmissionFollowUps,
          },
        ],
      },
      {
        path: "attendenceManagement",
        children: [
          {
            path: "attendence",
            Component: Attendences,
          },
          {
            path: "attendenceLive",
            Component: AttendenceLive,
          },
          {
            path: "attendenceReports",
            Component: AttendenceReports,
          },
        ],
      },
      {
        path: "financeManagement",
        children: [
          {
            path: "finances",
            Component: Finances,
          },
          {
            path: "newFeeEntry",
            Component: NewFeeEntry,
          },
          {
            path: "financesCollected",
            Component: FeesCollected,
          },
          {
            path: "financesDues",
            Component: FeesDues,
          },
          {
            path: "financesReports",
            Component: FeesReport,
          },
          {
            path: "expenses",
            Component: Expense,
          },
        ],
      },
      {
        path: "batchManagement",
        children: [
          {
            path: "batches",
            Component: Batches,
          },
          {
            path: "createBatches",
            Component: CreateBatches,
          },
        ],
      },
      {
        path: "performanceManagement",
        children: [
          {
            path: "exams",
            Component: Exams,
          },
          {
            path: "examsResults",
            Component: ExamsResults,
          },
          {
            path: "examsAnalytics",
            Component: ExamsAnalytics,
          },
        ],
      },
      // Multi-Tenant Routes
      {
        path: "subscription",
        Component: SubscriptionManagement,
      },
      {
        path: "users",
        Component: UserManagement,
      },
      {
        path: "organization-settings",
        Component: OrganizationSettings,
      },
    ],
  },
]);

export default router;
