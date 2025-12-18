import { createBrowserRouter } from "react-router";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/Overview";
import StudentManagement from "./pages/StudentManagement/StudentManagement";
import Students from "./pages/StudentManagement/Students";

const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      {
        path: "/dashboard/overview", 
        Component: Overview
      }, 
      {
        path: "/dashboard/studentManagement",
        Component: StudentManagement, 
        children: [
          {
            path: "/dashboard/studentManagement/students", 
            Component: Students
          }
        ]
      }
    ]
  },
]);

export default router;