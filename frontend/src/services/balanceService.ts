
import { api } from "../api/api";
import { Balance } from "../types/models";

export const fetchBalance = async (): Promise<Balance> => {
  const { data } = await api.get("/balance");
  return data;
};

export const updateBalance = async (payload: Balance): Promise<Balance> => {
  const { data } = await api.put("/balance", payload);
  return data;
};
