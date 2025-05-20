import { fetchPots } from "../../services/potsService";
import queryClient from "../../queryClient";

export const potsLoader = () => async () => {
    await queryClient.ensureQueryData({
        queryKey: ["pots"],
        queryFn: fetchPots
    });
    
    return null;
};
