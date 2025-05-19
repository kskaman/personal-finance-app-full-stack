import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBalance, updateBalance } from "../../../services/balanceService";
import { Balance } from "../../../types/models";

export const useBalance = () =>
  useQuery({ queryKey: ["balance"], queryFn: fetchBalance });

export const useUpdateBalance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Balance) => updateBalance(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["balance"] }),
  });
};
