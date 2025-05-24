import { api } from "../api/api";

export const fetchPots = async () => {
    const { data } = await api.get("/pots");
    return data;
}

export const fetchPotStats = async (): Promise<{
    totalSaved: number,
    topPots: {
        name: string;
        total: number;
        theme: string
    }[]
}> => {
    const { data } = await api.get("/pots/stats");
    return data;
}

export const createPot = async (payload: {
    name: string;
    target: number;
    theme: string;
}) => {
    const { data } = await api.post("/pots", payload);
    return data;
}


export const updatePot = async (
    id: string,
    payload: { name: string; target: number; theme: string }
  ) => {
    const { data } = await api.put(`/pots/${id}`, payload);
    return data;
};
  
export const deletePot = async (id: string) => {
    const { data } = await api.delete(`/pots/${id}`);
    return data;
};
  
export const potTransaction = async (
    id: string,
    payload: { type: "add" | "withdraw"; amount: number }
  ) => {
    const { data } = await api.post(`/pots/${id}/transactions`, payload);
    return data;
};