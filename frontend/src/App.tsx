import { Routes, Route, Navigate } from "react-router";

import DataProvider from "./context/DataProvider";

import MainRoutes from "./MainApp/MainRoutes";
import AuthRoutes from "./auth/AuthRoutes";
import NotFoundPage from "./NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import { useAuth } from "./auth/hooks/useAuth";

const App = () => {
  const { user } = useAuth();

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

      {/* ---- APP (protected) ---- */}
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

      {/* optional catch‑all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
