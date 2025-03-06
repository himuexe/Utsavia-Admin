// src/types/category.ts
export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    level?: number;
    path?: string;
    isActive: boolean;
    image?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CategoryFormData {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    level?: number;
    path?: string;
    isActive: boolean;
    image?: string;
  }