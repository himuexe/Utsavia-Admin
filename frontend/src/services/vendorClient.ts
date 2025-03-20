// Define the base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://utsavia-admin-server.onrender.com';

// Define interfaces
export interface VendorFilters {
  city?: string;
  isActive?: boolean;
  isDiscarded?: boolean;
  companyName?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface VendorData {
  _id?: string;
  name: string;
  email: string;
  password?: string; 
  phone?: string;
  address?: string;
  companyName?: string;
  paymentMode: 'upi' | 'bank';
  upiId?: string;
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  location?: string;
  city?: string;
  isActive?: boolean;
  isDiscarded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to handle fetch errors
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Error: ${response.status}`);
  }
  return response.json();
}

// API functions
export const vendorClient = {
  // Get all vendors with filtering
  getAllVendors: async (filters?: VendorFilters) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/vendor?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },
  
  // Get a single vendor by ID
  getVendorById: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching vendor with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Update a vendor
  updateVendor: async (id: string, vendorData: Partial<VendorData>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating vendor with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Toggle vendor active status
  toggleVendorStatus: async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error toggling status for vendor with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Mark vendor as discarded
  markVendorDiscarded: async (id: string, isDiscarded: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/${id}/discard`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDiscarded }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error marking vendor with ID ${id} as discarded:`, error);
      throw error;
    }
  },
  
  // Delete a vendor
  deleteVendor: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting vendor with ID ${id}:`, error);
      throw error;
    }
  }
};

export default vendorClient;