// src/api/itemApi.ts
import { api } from './authClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

const API_URL = `${API_BASE_URL}/items`;

export interface ItemPrice {
  city: string;
  price: number;
}

export interface Item {
  _id: string;
  name: string;
  description?: string;
  prices: ItemPrice[];
  category: {
    _id: string;
    name: string;
  } | string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ItemCreateInput = Omit<Item, '_id' | 'createdAt' | 'updatedAt'>;
export type ItemUpdateInput = Partial<ItemCreateInput>;

export const fetchItems = async (params?: {
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}) => {
  const response = await api.get(API_URL, { params });
  return response.data;
};

export const fetchItemById = async (id: string) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createItem = async (itemData: ItemCreateInput) => {
  const response = await api.post(API_URL, itemData);
  return response.data;
};

export const updateItem = async (id: string, itemData: ItemUpdateInput) => {
  const response = await api.put(`${API_URL}/${id}`, itemData);
  return response.data;
};

export const deactivateItem = async (id: string) => {
  const response = await api.patch(`${API_URL}/${id}/deactivate`);
  return response.data;
};

export const deleteItem = async (id: string) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};