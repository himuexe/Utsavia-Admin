// src/services/categoryService.ts
import { api } from './authClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

const API_ENDPOINT = `${API_URL}/api/category`;

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string[];
  isActive: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  data: Category | Category[];
  count?: number;
  message?: string;
}

export const categoryService = {
  // Get all categories with optional filters
  getAll: async (params?: {
    sort?: string;
    order?: 'asc' | 'desc';
    parentId?: string | null;
    search?: string;
    isActive?: boolean;
  }): Promise<CategoryResponse> => {
    try {
      const response = await api.get(API_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get category by ID
  getById: async (id: string): Promise<CategoryResponse> => {
    try {
      const response = await api.get(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new category
  create: async (categoryData: Partial<Category>): Promise<CategoryResponse> => {
    try {
      const response = await api.post(API_ENDPOINT, categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update existing category
  update: async (
    id: string, 
    categoryData: Partial<Category>
  ): Promise<CategoryResponse> => {
    try {
      const response = await api.put(`${API_ENDPOINT}/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete category
  delete: async (id: string): Promise<CategoryResponse> => {
    try {
      const response = await api.delete(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get category tree (helper function to organize categories in hierarchy)
  getCategoryTree: async (): Promise<Category[]> => {
    try {
      const response = await api.get(API_ENDPOINT);
      const categories = response.data.data as Category[];
      
      // Map to keep track of categories by ID
      const categoryMap = new Map<string, Category & { children: Category[] }>();
      
      // Initialize with empty children arrays
      categories.forEach(category => {
        categoryMap.set(category._id, { ...category, children: [] });
      });
      
      // Build the tree
      const rootCategories: Category[] = [];
      
      categories.forEach(category => {
        const categoryWithChildren = categoryMap.get(category._id);
        
        if (category.parentId && categoryMap.has(category.parentId)) {
          // Add to parent's children
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children.push(categoryWithChildren!);
          }
        } else {
          // Root level category
          rootCategories.push(categoryWithChildren!);
        }
      });
      
      return rootCategories;
    } catch (error) {
      throw error;
    }
  }
};