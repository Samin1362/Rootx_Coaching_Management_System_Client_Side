import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router/dom";
import router from './router.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from './contexts/auth/AuthProvider.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <RouterProvider router={router}></RouterProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)
