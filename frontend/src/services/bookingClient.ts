export const API_URL = import.meta.env.VITE_API_URL || 'https://utsavia-admin-server.onrender.com/api';

export interface Vendor {
  _id: string;
  name: string;
  companyName?: string;
}
export interface BookingItem {
  itemId: string;
  itemName: string;
  price: number;
  date: Date;
  timeSlot: string;
  vendorId?: string | Vendor; 
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentIntentId?: string;
  address: Address;
  createdAt: Date;
  updatedAt: Date;
}
export interface PaginatedResponse<T> {
  bookings: T[];
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

class BookingApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : '',
    };
  }

  async getBookings(filters: BookingFilters = {}): Promise<PaginatedResponse<Booking>> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });

      const response = await fetch(`${API_URL}/booking/admin/bookings?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  async getBookingById(id: string): Promise<Booking> {
    try {
      const response = await fetch(`${API_URL}/booking/admin/bookings/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error(`Error fetching booking with ID ${id}:`, error);
      throw error;
    }
  }


  async updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    try {
      const response = await fetch(`${API_URL}/booking/admin/bookings/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: this.getHeaders(),
        body: JSON.stringify(bookingData),
      });
      return await response.json();
    } catch (error) {
      console.error(`Error updating booking with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteBooking(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_URL}/booking/admin/bookings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error(`Error deleting booking with ID ${id}:`, error);
      throw error;
    }
  }

  async getBookingStats(startDate?: string, endDate?: string): Promise<BookingStats> {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await fetch(`${API_URL}/booking/admin/bookings/stats?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
      throw error;
    }
  }
}

export const bookingApi = new BookingApiClient();