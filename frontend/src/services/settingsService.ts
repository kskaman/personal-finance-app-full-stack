import { api } from "../api/api";


export const updateFont = (font: string) =>
  api.put("/settings/font", { font });

export const updateCurrency = (currency: string) =>
  api.put("/settings/currency", { currency });


export const updateDisplayedPots = (pots: boolean) =>
  api.put("/settings/displayedPots", { pots });

export const updateDisplayedBills = (bills: boolean) =>
  api.put("/settings/displayedBills", { bills });

export const updateDisplayedBudgets = (budgets: boolean) =>
  api.put("/settings/displayedBudgets", { budgets });


export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const deleteAccount = async () =>  await api.delete("/auth/users/me", { withCredentials: true });
