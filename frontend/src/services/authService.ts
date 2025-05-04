import { AxiosError } from "axios";
import { api } from "../api/api.ts";

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

export const logoutUser = async (): Promise<void> => {
    await api.post("/auth/logout");
  };

export const deleteAccount = async () =>  await api.delete("/auth/users/me", { withCredentials: true });
  

export const me = async () => {
    try {
        const response = await api.get("/auth/users/me", { withCredentials: true });
        return response.data;
    } catch (error) {
        // If the error is 401 (Unauthorized), return null instead of throwing
        if (error instanceof AxiosError && error.response?.status === 401) {
            return null;
        }
        throw error;
    }
}