import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryKey,
} from "@tanstack/react-query";
  
import {
    fetchBills,
    fetchBillStats,
    createBill,
    updateBill,
    deleteBill
} from "../../../services/billsService";

const listKey = (params: string): QueryKey => ["bills", params];
  const statsKey: QueryKey = ["bills", "stats"];
  
/* ---------- LIST / STATS ---------- */
export const useBills = (params: URLSearchParams) =>
    useQuery({
        queryKey: listKey(params.toString()),
        queryFn: () => fetchBills(params),
});
  
export const useBillStats = () =>
    useQuery({ queryKey: statsKey, queryFn: fetchBillStats });
  
/* ---------- MUTATIONS (invalidate list + stats) ---------- */
const useInvalidate = () => {
    const qc = useQueryClient();
    return () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
    };
};
  
export const useCreateBill = () => {
    const invalidate = useInvalidate();
    return useMutation({ mutationFn: createBill, onSuccess: invalidate });
};
  
export const useUpdateBill = () => {
    const invalidate = useInvalidate();
    return useMutation({
      mutationFn: ({ id, data }:
        {
          id: string;
          data: {
            name: string,
            amount: number,
            dueDate: string,
            category: string
          }
        }) =>
        updateBill(id, data),
      onSuccess: invalidate,
    });
};
  
export const useDeleteBill = () => {
    const invalidate = useInvalidate();
    return useMutation({ mutationFn: deleteBill, onSuccess: invalidate });
};
  