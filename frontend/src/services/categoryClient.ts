// src/services/categoryClient.ts
const API_URL = import.meta.env.VITE_API_URL || 'https://utsavia-admin-server.onrender.com';
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
  getAll: async (params?: {
    sort?: string;
    order?: 'asc' | 'desc';
    parentId?: string | null;
    search?: string;
    isActive?: boolean;
  }): Promise<CategoryResponse> => {
    try {
      const queryParams = new URLSearchParams(params as Record<string, string>);
      const response = await fetch(`${API_ENDPOINT}?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string): Promise<CategoryResponse> => {
    try {
      const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  create: async (categoryData: Partial<Category>, imageFile?: File): Promise<CategoryResponse> => {
    try {
      const formData = new FormData();
      
      // Add category data to form
      Object.entries(categoryData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, categoryData: Partial<Category>, imageFile?: File): Promise<CategoryResponse> => {
    try {
      const formData = new FormData();
      
      // Add category data to form
      Object.entries(categoryData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string): Promise<CategoryResponse> => {
    try {
      const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  getCategoryTree: async (): Promise<Category[]> => {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const categories = (await response.json()).data as Category[];

      const categoryMap = new Map<string, Category & { children: Category[] }>();
      categories.forEach(category => {
        categoryMap.set(category._id, { ...category, children: [] });
      });

      const rootCategories: Category[] = [];
      categories.forEach(category => {
        const categoryWithChildren = categoryMap.get(category._id);
        if (category.parentId && categoryMap.has(category.parentId)) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children.push(categoryWithChildren!);
          }
        } else {
          rootCategories.push(categoryWithChildren!);
        }
      });

      return rootCategories;
    } catch (error) {
      throw error;
    }
  },
};