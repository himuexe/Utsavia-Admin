
const API_URL = import.meta.env.VITE_API_URL || 'https://utsavia-admin-server.onrender.com/api';

interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export const fetchAdmins = async (): Promise<AdminData[]> => {
  try {
    const response = await fetch(`${API_URL}/admins`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.admins;
    } else {
      throw new Error(data.message || 'Failed to fetch admins');
    }
  } catch (err) {
    console.error('Error fetching admins:', err);
    throw new Error('Error connecting to server');
  }
};

export const createAdmin = async (adminData: CreateAdminData): Promise<AdminData> => {
  try {
    const response = await fetch(`${API_URL}/admins`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });
    
    const data = await response.json();
    
    if (data.success && data.admin) {
      return data.admin;
    } else {
      throw new Error(data.message || 'Failed to create admin');
    }
  } catch (err) {
    console.error('Error creating admin:', err);
    throw new Error('Error connecting to server');
  }
};

export const deleteAdmin = async (adminId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/admins/${adminId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete admin');
    }
  } catch (err) {
    console.error('Error deleting admin:', err);
    throw new Error('Error connecting to server');
  }
};