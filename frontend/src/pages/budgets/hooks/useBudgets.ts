import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  fetchBudgetStats,
  fetchTransactionsByBudget,
} from "../../../services/budgetsService.js";
import { Budget, Transaction } from "../../../types/models.js";
import { BudgetStats } from "../../../types/Data.js";

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["budgets"] });
};

export const useBudgets = (): UseQueryResult<Budget[], Error> => {
  return useQuery({ queryKey: ["budgets"], queryFn: fetchBudgets });
};

export const useBudgetTransactions = (budgetCategories: string[]):
  UseQueryResult<Record<string, Transaction[]>, Error> => {
  return useQuery({
    queryKey: ["budgets", "transactionsPerMonth", budgetCategories],
    queryFn: () => fetchTransactionsByBudget(budgetCategories),
    enabled: budgetCategories.length > 0,
  });
};


export const useCreateBudget = ():
UseMutationResult<
Budget,
Error,
{ category: string; maximum: number; theme: string }
> => {
  
  return useMutation({
    mutationFn: createBudget,
    onSuccess: useInvalidate(),
  });
};

export const useUpdateBudget = () : UseMutationResult<
Budget,
Error,
{ id: string; maximum: number; theme: string }
>  => {
  
  return useMutation({
    mutationFn: updateBudget,
    onSuccess: useInvalidate(),
  });
};

export const useDeleteBudget = (): UseMutationResult<void, Error, string> => {
  
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: useInvalidate(),
  });
};


export const useBudgetStats = () :  UseQueryResult<BudgetStats, Error>=> {
  return useQuery({ queryKey: ["budgets", "stats"], queryFn: fetchBudgetStats })
}