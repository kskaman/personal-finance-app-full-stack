import { createBrowserRouter, Navigate, Outlet } from "react-router";
import MainRoutes from "./MainApp/MainRoutes";
import ProtectedRoute from "./components/ProtectedRoutes";
import DataProvider from "./context/DataProvider";
import RootRedirect from "./components/RootRedirect";
import AuthRoutes from "./pages/auth/AuthRoutes";
import queryClient from "./queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/auth/*",
    element: <AuthRoutes />,
  },
  {
    path: "/app/*",
    element: (
      <ProtectedRoute>
        <DataProvider>
          <QueryClientProvider client={queryClient}>
            <Outlet />
          </QueryClientProvider>
        </DataProvider>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "*",
        element: <MainRoutes />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
