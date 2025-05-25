import { api } from "../api/api";


export const updateFont = (font: string) =>
  api.put("/settings", { font });

export const updateCurrency = (currency: string) =>
  api.put("/settings", { currency });


export const updateDisplayedPots = (pots: boolean) =>
  api.put("/settings", { pots });

export const updateDisplayedBills = (bills: boolean) =>
  api.put("/settings", { bills });

export const updateDisplayedBudgets = (budgets: boolean) =>
  api.put("/settings", { budgets });


export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const deleteAccount = async () =>  await api.delete("/user/me", { withCredentials: true });
