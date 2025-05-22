import { api } from "../api/api";
import { RecurringBill } from "../types/models";

export const fetchBills = ()  : Promise<RecurringBill[]> =>
  api.get("/bills").then((res) => res.data);

export const fetchBillStats = () =>
  api.get("/bills/stats").then((res) => res.data);

export const createBill = (data: RecurringBill) =>
  api.post("/bills", data).then((res) => res.data);

export const updateBill = (
  id: string,
  data: {
    name: string,
    amount: number,
    dueDate: string,
    category: string
  }) =>
  api.put(`/bills/${id}`, data).then((res) => res.data);

export const deleteBill = (id: string) =>
  api.delete(`/bills/${id}`).then((r) => r.data);
