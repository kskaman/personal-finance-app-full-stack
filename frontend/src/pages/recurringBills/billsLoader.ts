import { fetchBills, fetchBillStats } from "../../services/billsService";
import queryClient from "../../queryClient";

export const billsLoader =
  () =>
  async () => {
    await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ["bills"],
        queryFn: fetchBills,
      }),
      queryClient.ensureQueryData({
        queryKey: ["bills", "stats"],
        queryFn: fetchBillStats,
      }),
    ]);
    return null;
};