import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import router from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./contexts/auth/AuthProvider";
import { OrganizationProvider } from "./contexts/organization/OrganizationContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import "./i18n";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>
          <NotificationProvider>
            <RouterProvider router={router} />
          </NotificationProvider>
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
