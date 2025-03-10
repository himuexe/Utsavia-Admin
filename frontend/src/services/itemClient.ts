const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://utsavia-admin-server.onrender.com/api';
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
  const queryParams = new URLSearchParams(params as Record<string, string>);
  const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const fetchItemById = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const createItem = async (itemData: ItemCreateInput, imageFile?: File) => {
  // Use FormData if there's an image to upload
  if (imageFile) {
    const formData = new FormData();
    
    // Add all item data as form fields
    formData.append('name', itemData.name);
    if (itemData.description) formData.append('description', itemData.description);
    formData.append('category', typeof itemData.category === 'string' ? itemData.category : itemData.category._id);
    formData.append('isActive', String(itemData.isActive));
    
    // Add prices as JSON string
    formData.append('prices', JSON.stringify(itemData.prices));
    
    // Add the image file
    formData.append('image', imageFile);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return await response.json();
  } else {
    // Use JSON if no image to upload
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    return await response.json();
  }
};

export const updateItem = async (id: string, itemData: ItemUpdateInput, imageFile?: File) => {
  // Use FormData if there's an image to upload
  if (imageFile) {
    const formData = new FormData();
    
    // Add all item data as form fields
    if (itemData.name) formData.append('name', itemData.name);
    if (itemData.description) formData.append('description', itemData.description);
    if (itemData.category) {
      formData.append('category', typeof itemData.category === 'string' ? itemData.category : itemData.category._id);
    }
    if (itemData.isActive !== undefined) formData.append('isActive', String(itemData.isActive));
    
    // Add prices as JSON string if provided
    if (itemData.prices) {
      formData.append('prices', JSON.stringify(itemData.prices));
    }
    
    // Add the image file
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    return await response.json();
  } else {
    // Use JSON if no image to upload
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    return await response.json();
  }
};

export const deactivateItem = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}/deactivate`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const deleteItem = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};