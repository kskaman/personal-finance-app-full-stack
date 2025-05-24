import queryClient from "../../queryClient";
import { fetchBalance } from "../../services/balanceService";
import { fetchBillStats } from "../../services/billsService";
import { fetchPotStats } from "../../services/potsService";


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
    })
  ]);
  return null;  
};
