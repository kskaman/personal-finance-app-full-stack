import { api } from "../api/api";
import { RecurringBill } from "../types/models";

export const fetchBills = async ()  : Promise<RecurringBill[]> =>
  await api.get("/bills").then((res) => res.data);

export const fetchBillStats = async () =>
  await api.get("/bills/stats").then((res) => res.data);

export const createBill = async (data: RecurringBill) =>
  await api.post("/bills", data).then((res) => res.data);

export const updateBill = async (
  id: string,
  data: {
    name: string,
    amount: number,
    dueDate: string,
    category: string
  }) =>
  await api.put(`/bills/${id}`, data).then((res) => res.data);

export const deleteBill = async (id: string) =>
  await api.delete(`/bills/${id}`).then((r) => r.data);
