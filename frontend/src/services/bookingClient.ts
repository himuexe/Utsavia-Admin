import axios from 'axios';

export const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:7000/api';

// Types (unchanged)
export interface BookingItem {
  itemName: string;
  price: number;
  date: Date;
  timeSlot: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary?: boolean;
}

export interface Booking {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    primaryEmail: string;
  };
  items: BookingItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentIntentId?: string;
  address: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface BookingStats {
  totalBookings: number;
  bookingsByStatus: { _id: string; count: number }[];
  revenue: {
    totalRevenue: number;
    averageBookingValue: number;
    maxBookingValue: number;
  };
  bookingsByDay: {
    _id: string;
    count: number;
    revenue: number;
  }[];
}

// API Client
class BookingApiClient {
  private token: string | null = null;
  
  setToken(token: string) {
    this.token = token;
  }
  
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    };
  }
  
  // Configure Axios to send cookies with each request
  private configureAxios() {
    axios.defaults.withCredentials = true;
  }
  
  // Get all bookings with pagination and filtering
  async getBookings(filters: BookingFilters = {}): Promise<PaginatedResponse<Booking>> {
    try {
      this.configureAxios(); // Ensure cookies are sent
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.sortField) queryParams.append('sortField', filters.sortField);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.minAmount) queryParams.append('minAmount', filters.minAmount.toString());
      if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount.toString());
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await axios.get(`${API_URL}/booking/admin/bookings?${queryParams.toString()}`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }
  
  // Get booking by ID
  async getBookingById(id: string): Promise<Booking> {
    try {
      this.configureAxios(); // Ensure cookies are sent
      const response = await axios.get(`${API_URL}/booking/admin/bookings/${id}`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Create booking
  async createBooking(bookingData: Omit<Booking, '_id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    try {
      this.configureAxios(); // Ensure cookies are sent
      const response = await axios.post(`${API_URL}/booking/admin/bookings`, bookingData, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }
  
  // Update booking
  async updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    try {
      this.configureAxios(); // Ensure cookies are sent
      const response = await axios.put(`${API_URL}/booking/admin/bookings/${id}`, bookingData, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating booking with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Delete booking
  async deleteBooking(id: string): Promise<{ message: string }> {
    try {
      this.configureAxios(); // Ensure cookies are sent
      const response = await axios.delete(`${API_URL}/booking/admin/bookings/${id}`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting booking with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Get booking statistics
  async getBookingStats(startDate?: string, endDate?: string): Promise<BookingStats> {
    try {
      this.configureAxios(); // Ensure cookies are sent
      const queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const response = await axios.get(`${API_URL}/booking/admin/bookings/stats?${queryParams.toString()}`, {
        headers: this.getHeaders()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const bookingApi = new BookingApiClient();