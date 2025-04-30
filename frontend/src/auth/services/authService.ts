import { api } from "../../api/api.ts";

export const signup =
    (params: { email: string, password: string }) =>
        api.post("/auth/signup", params);

export const login =
    (params: { email: string, password: string }) =>
        api.post("/auth/login", params);

export const forgotPassword = (email: string) =>
    api.post("auth/forgot-password", { email });

export const resetPassword =
    (params: { sid: string, newPassword: string }) =>
        api.post("auth/reset-password", params);

export const resendVerification = (email: string) => 
    api.post("/auth/resend-verification", { email })

export const me = () => api.get("/auth/users/me");