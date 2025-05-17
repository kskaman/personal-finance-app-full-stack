import { QueryClient } from "@tanstack/react-query";
import { fetchBills } from "../../services/billsService";

export const billsLoader =
  (qc: QueryClient) =>
  async ({ request }: { request: Request }) => {
    const params = new URL(request.url).searchParams;
    await qc.ensureQueryData({
      queryKey: ["bills", params.toString()],
      queryFn: () => fetchBills(params),
    });
    return null;
};
