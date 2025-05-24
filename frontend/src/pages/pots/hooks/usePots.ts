import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    fetchPots,
    createPot,
    updatePot,
    deletePot,
    potTransaction,
    fetchPotStats,
} from "../../../services/potsService";
  
export const usePots = () =>
    useQuery({ queryKey: ["pots"], queryFn: fetchPots });

export const usePotStats = () =>
  useQuery({ queryKey: ["pots", "stats"], queryFn: fetchPotStats });

const useInvalidate = () => {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: ["pots"] });
};
  
export const useCreatePot = () =>
    useMutation({ mutationFn: createPot, onSuccess: useInvalidate() });
  
export const useUpdatePot = () =>
    useMutation({
      mutationFn: (
        { id, data }: {
          id: string;
          data: { name: string, theme: string, target: number }
        }) => updatePot(id, data),
      onSuccess: useInvalidate(),
});
  
export const useDeletePot = () =>
    useMutation({ mutationFn: deletePot, onSuccess: useInvalidate() });
  
export const usePotTransaction = () =>
    useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: string;
        data: { type: "add" | "withdraw"; amount: number };
      }) => potTransaction(id, data),
      onSuccess: useInvalidate(),
});
  