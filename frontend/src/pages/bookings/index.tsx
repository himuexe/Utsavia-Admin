import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaSync } from 'react-icons/fa';
import { bookingsApi } from '../../services/apiClient';
import BookingDetails from './BookingDetails';
import BookingForm from './BookingForm';

// Define booking type based on your model
interface BookingItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Booking {
  _id: string;
  userId: string;
  items: BookingItem[];
  totalAmount: number;
  status: 'pending' | 'paid'  | 'cancelled';
  paymentIntentId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingsApi.getAll();
      setBookings(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let result = [...bookings];
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }
    if (searchTerm) {
      result = result.filter(booking => 
        booking._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        booking.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredBookings(result);
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleDeleteConfirmation = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    try {
      await bookingsApi.delete(selectedBooking._id);
      setBookings(bookings.filter(b => b._id !== selectedBooking._id));
      setIsDeleteModalOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      setError('Failed to delete booking. Please try again.');
    }
  };

  const handleUpdateBooking = async (updatedBooking: Booking) => {
    try {
      const result = await bookingsApi.update(updatedBooking._id, updatedBooking);
      setBookings(bookings.map(b => b._id === result._id ? result : b));
      setIsEditModalOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      setError('Failed to update booking. Please try again.');
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = '';
    switch (status) {
      case 'pending':
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'confirmed':
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'completed':
        colorClass = 'bg-green-100 text-green-800';
        break;
      case 'cancelled':
        colorClass = 'bg-red-100 text-red-800';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colorClass} uppercase font-semibold`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2D3436]">Bookings</h1>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              className="block w-full pl-10 pr-3 py-2 border border-[#F0F0F0] rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-[#F0F0F0] rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <button 
              onClick={fetchBookings}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B6B]/50"
            >
              <FaSync className="inline-block mr-2" /> Refresh
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <span className="sr-only">Close</span>
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        )}

        {/* Bookings table */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B6B]"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-[#F9F9F9] p-10 text-center rounded-md">
            <p className="text-[#2D3436]/70">No bookings found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#F0F0F0]">
              <thead className="bg-[#F9F9F9]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#2D3436] uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#2D3436] uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#2D3436] uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#2D3436] uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#2D3436] uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#2D3436] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#F0F0F0]">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-[#F9F9F9]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2D3436]">
                      {booking._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3436]">
                      {booking.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3436]">
                      ${booking.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3436]">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3436]">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-[#FF6B6B] hover:text-[#FF6B6B]/90"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-[#2D3436] hover:text-[#FF6B6B]"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirmation(booking)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Booking Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#2D3436]">Booking Details</h2>
                <button 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="text-[#2D3436] hover:text-[#FF6B6B]"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <BookingDetails booking={selectedBooking} />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="py-2 px-4 border border-[#F0F0F0] rounded-md shadow-sm text-sm font-medium text-[#2D3436] bg-white hover:bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {isEditModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#2D3436]">Edit Booking</h2>
                <button 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="text-[#2D3436] hover:text-[#FF6B6B]"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <BookingForm 
                booking={selectedBooking} 
                onSubmit={handleUpdateBooking} 
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setSelectedBooking(null);
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#2D3436]">Confirm Delete</h2>
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="text-[#2D3436] hover:text-[#FF6B6B]"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <p className="mb-6 text-[#2D3436]">Are you sure you want to delete booking <span className="font-semibold">{selectedBooking._id}</span>? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="py-2 px-4 border border-[#F0F0F0] rounded-md shadow-sm text-sm font-medium text-[#2D3436] bg-white hover:bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBooking}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B6B]/50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;