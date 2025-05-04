import { Navigate, useLocation } from "react-router";
import { useAuth } from "../auth/hooks/useAuth";
import { ReactNode } from "react";
import Loader from "../ui/Loader";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authLoading } = useAuth();

  const location = useLocation();

  if (authLoading) return <Loader />;

  // If not authenticated, redirect to login with return URL
  if (!user) {
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
