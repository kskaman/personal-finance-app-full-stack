import { QueryClient } from "@tanstack/react-query";
import { fetchPots } from "../../services/potsService";

export const potsLoader = (qc: QueryClient) => async () => {
    await qc.ensureQueryData({
        queryKey: ["pots"],
        queryFn: fetchPots
    });
    
    return null;
};
