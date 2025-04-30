import { Navigate } from "react-router";
import { useAuth } from "../auth/hooks/useAuth";
import { ReactNode } from "react";
import Loader from "../ui/Loader";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authLoading } = useAuth();
  console.log(user);
  if (authLoading) return <Loader />;

  return user ? children : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
