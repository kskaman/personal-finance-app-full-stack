import queryClient from "../../queryClient";
import { fetchTransactions, TxQuery } from "../../services/transactionService";

export const transactionsLoader =
  () =>
    async ({ q }: { q: TxQuery }) => {
      await queryClient.ensureQueryData({
        queryKey: ['transactions', { q }],
        queryFn: () => fetchTransactions(q),
      });
    return null;
};

