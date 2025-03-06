// src/services/apiClient.ts
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear user state and avoid redirecting if already on the login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Booking API endpoints
export const bookingsApi = {
  // Get all bookings
  getAll: async () => {
    try {
      const response = await api.get('/booking/bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Get booking by ID
  getById: async (id: string) => {
    try {
      const response = await api.get(`/booking/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new booking
  create: async (bookingData: any) => {
    try {
      const response = await api.post('/booking/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Update booking
  update: async (id: string, bookingData: any) => {
    try {
      const response = await api.put(`/booking/bookings/${id}`, bookingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating booking with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete booking
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/booking/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting booking with ID ${id}:`, error);
      throw error;
    }
  },

  // Get bookings by user ID
  getByUserId: async (userId: string) => {
    try {
      const response = await api.get(`/booking/bookings/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookings for user ${userId}:`, error);
      throw error;
    }
  },

  // Get bookings by status
  getByStatus: async (status: string) => {
    try {
      const response = await api.get(`/booking/bookings/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookings with status ${status}:`, error);
      throw error;
    }
  },
};

export default api;