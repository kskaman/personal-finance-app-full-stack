import queryClient from "../../queryClient";
import { fetchBalance } from "../../services/balanceService";
import { fetchBillStats } from "../../services/billsService";
import { fetchBudgetStats } from "../../services/budgetsService";
import { fetchPotStats } from "../../services/potsService";
import { fetchLatestTransactions } from "../../services/transactionService";


export const overviewLoader = async () => {
  await Promise.all([
    queryClient.ensureQueryData({
      queryKey: ["balance"],
      queryFn: fetchBalance,
    }),
    queryClient.ensureQueryData({
      queryKey: ["bills", "stats"],
      queryFn: fetchBillStats,
    }),
    queryClient.ensureQueryData({
      queryKey: ["pots", "stats"],
      queryFn: fetchPotStats,
    }),
    queryClient.ensureQueryData({
      queryKey: ["budgets", "stats"],
      queryFn: fetchBudgetStats
    }),
    queryClient.ensureQueryData({
      queryKey: ["transactions", "latest"],
      queryFn: fetchLatestTransactions, })
  ]);
  return null;  
};
