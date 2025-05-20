import { fetchBudgets, fetchBudgetStats } from "../../services/budgetsService";
import queryClient from "../../queryClient";

export const budgetsLoader =
    () => 
    async () => {
        await Promise.all([
            queryClient.ensureQueryData({
                queryKey: ["budgets"],
                queryFn: fetchBudgets,
            }),
            queryClient.ensureQueryData({
                queryKey: ["budgets", "stats"],
                queryFn: fetchBudgetStats,
            })
        ])
    
    return null;
}