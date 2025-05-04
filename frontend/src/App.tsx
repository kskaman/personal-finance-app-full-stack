import { Routes, Route, Navigate } from "react-router";

import DataProvider from "./context/DataProvider";

import MainRoutes from "./MainApp/MainRoutes";
import AuthRoutes from "./auth/AuthRoutes";
import ProtectedRoute from "./components/ProtectedRoutes";
import { useAuth } from "./auth/hooks/useAuth";
import Loader from "./ui/Loader";

const App = () => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* ---- default landing: send to the right place ---- */}
      <Route
        path="/"
        element={
          <Navigate to={user ? "/app/overview" : "/auth/login"} replace />
        }
      />

      {/* ---- AUTH ---- */}
      {!user && <Route path="/auth/*" element={<AuthRoutes />} />}
      {/* / → /auth/login */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      {/* Protected Dashboard route */}
      {user && (
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <DataProvider>
                <MainRoutes />
              </DataProvider>
            </ProtectedRoute>
          }
        />
      )}

      {/* Catch-all route for authenticated users */}
      {user && (
        <Route path="*" element={<Navigate to="/app/overview" replace />} />
      )}

      {/* Catch-all route for unauthenticated users */}
      {!user && (
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      )}
    </Routes>
  );
};

export default App;
