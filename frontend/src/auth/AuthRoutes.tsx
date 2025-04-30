import { Navigate, Route, Routes } from "react-router";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import AuthPage from "./AuthPage";
import ResetPasswordForm from "./components/ResetPasswordForm";

const AuthRoutes = () => (
  <Routes>
    {/* 
        This Route now matches exactly "/auth/*" 
        because AuthRoutes is mounted at "auth/*" in App.tsx
      */}
    <Route path="" element={<AuthPage />}>
      {/* /auth        → /auth/login */}
      <Route index element={<Navigate to="login" replace />} />

      {/* /auth/login */}
      <Route path="login" element={<LoginForm />} />

      {/* /auth/signup */}
      <Route path="signup" element={<SignupForm />} />

      {/* /auth/forgot-password */}
      <Route path="forgot-password" element={<ForgotPasswordForm />} />

      {/* /auth/reset-password */}
      <Route path="reset-password" element={<ResetPasswordForm />} />
    </Route>
  </Routes>
);

export default AuthRoutes;
