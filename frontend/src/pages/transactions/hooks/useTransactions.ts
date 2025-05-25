import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTransactions,
  createTx,
  updateTx,
  deleteTx,
  TxQuery,
  TxProps,
  fetchTxnMeta,
  fetchLatestTransactions,
} from "../../../services/transactionService.ts";

export const useTransactions = ({ params }: { params: TxQuery }) => useQuery({
    queryKey: ["transactions", params.page, params.month, params.category, params.searchName, params.sortBy],
    queryFn: () => fetchTransactions(params),
    placeholderData: (prevData) => prevData,
  });

export const useLatestTx = () => useQuery({
    queryKey: ["transactions", "latest"],
    queryFn: fetchLatestTransactions,
})

export const useTxnStats = () => useQuery({
    queryKey: ["transactions", "txnStats"],
    queryFn: fetchTxnMeta, 
});

const useInvalidate = () => {
    const qc = useQueryClient();
    return () => {
        qc.invalidateQueries({ queryKey: ["transactions"] });
        qc.invalidateQueries({ queryKey: ["transactions", "txnStats"] });
    }
}

export const useAddTx = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: createTx,
        onSuccess: invalidate,
    });
};

export const useEditTx = () => {
    const invalidate = useInvalidate();
    
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: TxProps }) =>
            updateTx(id, payload),
        onSuccess: invalidate,
    });
}


export const useRemoveTx = () => {
    const invalidate = useInvalidate();
    
    return useMutation({
        mutationFn: deleteTx,
        onSuccess: invalidate,
  });
};

