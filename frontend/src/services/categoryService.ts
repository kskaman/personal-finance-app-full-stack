import { Category } from '../types/models';
import { api } from '../api/api';

const base = '/categories';

export const getCategories = (): Promise<Category[]> =>
  api.get(base).then(r => r.data);

export const getCategory = (id: string): Promise<Category> =>
  api.get(`${base}/${id}`).then(r => r.data);

export const createCategory = (name: string): Promise<Category> =>
  api.post(base, { name }).then(r => r.data);

export const renameCategory = (id: string, name: string): Promise<Category> =>
  api.put(`${base}/${id}`, { name }).then(r => r.data);

export const deleteCategory = (id: string): Promise<void> =>
  api.delete(`${base}/${id}`).then(() => {});
