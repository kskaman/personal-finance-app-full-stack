import { api } from "../api/api";
import { Transaction } from "../types/models";

export interface TxQuery {
  page : number;
  month:       string;
  searchName:  string;
  category:    string;
  sortBy:      string;
}

export interface TxResponse {
  transactions:   Transaction[];
  total:  number;
  page:   number;
}

export interface TxProps {
  name: string;
  category: string;
  date: Date;
  amount: number;
  recurring?: null | boolean,
  recurringId?: string;
  dueDate?: string;
  theme?: string;
}

export const fetchTransactions = async (q: TxQuery): Promise<TxResponse> => {
  const { data } = await api.get<TxResponse>("/transactions", { params: q });
  return data;
};

export const createTx = async (payload: TxProps) => {
  console.log(payload);
  return await api.post("/transactions", payload);
}

export const updateTx = async (id: string, payload: TxProps) =>
  await api.put(`/transactions/${id}`, payload);

export const deleteTx = async (id: string) =>
  await api.delete(`/transactions/${id}`);

export const fetchTxnMeta = async (): Promise<{ total: number; monthOptions: string[] }> =>
  await api.get("/transactions/meta").then(res => res.data);
