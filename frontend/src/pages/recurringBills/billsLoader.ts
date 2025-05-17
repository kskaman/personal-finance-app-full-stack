import { QueryClient } from "@tanstack/react-query";
import { fetchBills, fetchBillStats } from "../../services/billsService";

export const billsLoader =
  (qc: QueryClient) =>
  async () => {
    await Promise.all([
      qc.ensureQueryData({
        queryKey: ["bills"],
        queryFn: fetchBills,
      }),
      qc.ensureQueryData({
        queryKey: ["bills", "stats"],
        queryFn: fetchBillStats,
      }),
    ]);
    return null;
};