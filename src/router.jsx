import { createBrowserRouter } from "react-router";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/Overview";
import Students from "./pages/StudentManagement/Students";
import AddStudent from "./pages/StudentManagement/AddStudent";
import ErrorPage from "./pages/ErrorPage";
import Admissions from "./pages/Admission&Enrollment/Admissions";
import NewAdmissions from "./pages/Admission&Enrollment/NewAdmissions";
import AdmissionFollowUps from "./pages/Admission&Enrollment/AdmissionFollowUps";

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
      }
    ]
  },
]);

export default router;