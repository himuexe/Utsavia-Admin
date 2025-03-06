// src/services/categoryApi.ts
import api from './apiClient';
import { ICategory } from '../types/category';

export const categoriesApi = {
  // Get all categories
  getAll: async (): Promise<ICategory[]> => {
    try {
      const response = await api.get('/category/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getById: async (id: string): Promise<ICategory> => {
    try {
      const response = await api.get(`/category/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new category
  create: async (categoryData: Partial<ICategory>): Promise<ICategory> => {
    try {
      const response = await api.post('/category/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  update: async (id: string, categoryData: Partial<ICategory>): Promise<ICategory> => {
    try {
      const response = await api.put(`/category/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete category
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/category/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      throw error;
    }
  }
};