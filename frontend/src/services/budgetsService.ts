import { api } from "../api/api";
import { BudgetStats } from "../types/Data";
import { Budget, Transaction } from "../types/models";

export const fetchBudgets = async (): Promise<Budget[]> => {
  const res = await api.get("/budgets");
  return res.data;
};

export const fetchTransactionsByBudget = async (budgetCategories: string[]):
  Promise<Record<string, Transaction[]>> => {
  const now = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const res = await api.post("/budgetCategories", {
    categoryNames: budgetCategories,
    month,
  });

  return res.data; // { [categoryName]: Transaction[] }
};


export const fetchBudgetStats = async (): Promise<BudgetStats> => {
  const res = await api.get("/api/budgets/stats");
  return res.data;
}

export const createBudget = async ({ category, maximum, theme }: {
  
    category: string;
    maximum: number;
    theme: string;
}) : Promise<Budget> => {
  const res = await api.post("/budgets", { category, maximum, theme });
  return res.data;
};

export const updateBudget = async ({ id, maximum, theme}: {
  id: string;
  
    maximum: number;
    theme: string;
  
} ) : Promise<Budget> => {
  const res = await api.put(`/budgets/${id}`, {maximum, theme });
  return res.data;
};

export const deleteBudget = async (id : string) : Promise<void>=> {
  const res = await api.delete(`/budgets/${id}`);
  return res.data;
};
