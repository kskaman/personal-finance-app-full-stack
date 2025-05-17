import { Navigate } from "react-router";
import { useAuth } from "../pages/auth/hooks/useAuth";
import Loader from "../ui/Loader";

const RootRedirect = () => {
  const { user, authLoading } = useAuth();

  if (authLoading) return <Loader />;

  return <Navigate to={user ? "/app/overview" : "/auth/login"} replace />;
};

export default RootRedirect;
