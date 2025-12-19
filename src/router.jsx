import { createBrowserRouter } from "react-router";
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
import Batches from "./pages/Batch&ClassManagement/Batches";
import CreateBatches from "./pages/Batch&ClassManagement/CreateBatches";
import Exams from "./pages/Performance&AssessmentTracking/Exams";
import ExamsResults from "./pages/Performance&AssessmentTracking/ExamsResults";
import ExamsAnalytics from "./pages/Performance&AssessmentTracking/ExamsAnalytics";

const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    errorElement: <ErrorPage></ErrorPage>, 
    children: [
      {
        path: "/dashboard/overview", 
        Component: Overview
      }, 
      {
        path: "/dashboard/studentManagement",
        children: [
          {
            path: "/dashboard/studentManagement/students", 
            Component: Students
          },
          {
            path: "/dashboard/studentManagement/addStudents", 
            Component: AddStudent
          }
        ]
      }, 
      {
        path: "/dashboard/admissionManagement", 
        children: [
          {
            path: "/dashboard/admissionManagement/admissions", 
            Component: Admissions
          },
          {
            path: "/dashboard/admissionManagement/newAdmission", 
            Component: NewAdmissions
          },
          {
            path: "/dashboard/admissionManagement/admissionFollowUps", 
            Component: AdmissionFollowUps
          },
        ]
      },
      {
        path: "/dashboard/attendenceManagement", 
        children: [
          {
            path: "/dashboard/attendenceManagement/attendence", 
            Component: Attendences
          },
          {
            path: "/dashboard/attendenceManagement/attendenceLive", 
            Component: AttendenceLive
          },
          {
            path: "/dashboard/attendenceManagement/attendenceReports", 
            Component: AttendenceReports
          },
        ]
      },
      {
        path: "/dashboard/financeManagement", 
        children: [
          {
            path: "/dashboard/financeManagement/finances", 
            Component: Finances
          },
          {
            path: "/dashboard/financeManagement/financesCollected", 
            Component: FeesCollected
          },
          {
            path: "/dashboard/financeManagement/financesDues", 
            Component: FeesDues
          },
          {
            path: "/dashboard/financeManagement/financesReports", 
            Component: FeesReport
          },
        ]
      },
      {
        path: "/dashboard/batchManagement", 
        children: [
          {
            path: "/dashboard/batchManagement/batches", 
            Component: Batches
          },
          {
            path: "/dashboard/batchManagement/createBatches", 
            Component: CreateBatches
          },
        ]
      },
      {
        path: "/dashboard/performanceManagement", 
        children: [
          {
            path: "/dashboard/performanceManagement/exams", 
            Component: Exams
          },
          {
            path: "/dashboard/performanceManagement/examsResults", 
            Component: ExamsResults
          },
          {
            path: "/dashboard/performanceManagement/examsAnalytics", 
            Component: ExamsAnalytics
          },
        ]
      },
    ]
  },
]);

export default router;