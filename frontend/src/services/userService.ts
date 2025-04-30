import { api } from "../api/api";
import { User } from "../types/models";

export const getUserData = async (): Promise<User> => {
    const response = await api.get("/user/data");
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};
