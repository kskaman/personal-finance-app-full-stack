import { api } from "../api/api";
import { User } from "../types/models";

export const getUserData = async (): Promise<User> => {
    const response = await api.get("/user/data");
  return response.data;
};

export const updateName = (name: string): Promise<User> =>
  api.patch<User>('/user/me/name', { name }).then(r => r.data);

export const changePassword = (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> =>
  api.patch<{ message: string }>('/user/me/password', { currentPassword, newPassword })
    .then(r => r.data);